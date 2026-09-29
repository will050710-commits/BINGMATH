"""Ad-hoc static guard (đợt 8 / 4I): names the new blocks use before binding.

Why this exists as a script rather than a comment: the ĝợt 8 changes added two
early-exit paths (the soft-deadline answer, and the render report) INSIDE a
6000-line function that already binds most of its state 700 lines further down.
That is precisely how `_plan` and `_answered` came to be referenced before they
existed — a NameError that only fires on the path that is hardest to test by hand
(a dense figure, on a slow request).

This walks `chat()` and reports any name loaded inside a chosen line range that is
not bound earlier in the function, not a parameter, and not a module global.
"""
import ast
import builtins
import io
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(HERE, "main.py")
FUNCTION = "chat"


def module_names(tree):
    names = set(dir(builtins))
    for node in tree.body:
        if isinstance(node, ast.Import):
            names.update(alias.asname or alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            names.update(alias.asname or alias.name for alias in node.names)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            names.add(node.name)
        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    names.add(target.id)
        elif isinstance(node, ast.Try):
            for sub in node.body + node.orelse + node.finalbody:
                if isinstance(sub, (ast.Assign,)):
                    for target in sub.targets:
                        if isinstance(target, ast.Name):
                            names.add(target.id)
    return names


def audit(source_path, function_name, marker_text, window=200):
    """Report names loaded in the audited window that are bound nowhere earlier."""
    source = io.open(source_path, encoding="utf-8").read()
    tree = ast.parse(source)
    lines = source.splitlines()
    marker = next(i + 1 for i, line in enumerate(lines) if marker_text in line)
    fn = [n for n in ast.walk(tree)
          if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == function_name]
    if not fn:
        print(f"[SKIP] {function_name}() not found")
        return 0
    fn = fn[0]
    params = {a.arg for a in fn.args.args}
    globals_known = module_names(tree)

    # Assignments, loop targets, comprehension targets, `with ... as` names,
    # parameters and handler exceptions are all bindings; collect them with the
    # line they are bound on, so a load can be checked against them individually.
    binds = []          # (line, name)
    for node in ast.walk(fn):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            binds.append((node.lineno, node.id))
        elif isinstance(node, ast.arg):
            binds.append((node.lineno, node.arg))
        elif isinstance(node, ast.ExceptHandler) and node.name:
            binds.append((node.lineno, node.name))
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            binds.append((node.lineno, node.name))
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            # A local import (e.g. `from typesafe_guard import typesafe_guard`
            # inside a try block) binds its names for the rest of the function.
            for alias in node.names:
                binds.append((node.lineno, alias.asname or alias.name))

    unbound = []
    for node in ast.walk(fn):
        if not isinstance(node, ast.Name) or not isinstance(node.ctx, ast.Load):
            continue
        if not (marker <= node.lineno < marker + window):
            continue
        if node.id in globals_known:
            continue
        if any(bind_line < node.lineno and bind_name == node.id
               for bind_line, bind_name in binds):
            continue
        unbound.append((node.lineno, node.id))

    if unbound:
        detail = ", ".join(f"{name}@L{line}" for line, name in sorted(set(unbound)))
        print(f"[{function_name}] block at line {marker}: UNBOUND -> {detail}")
        return 1
    print(f"[{function_name}] block at line {marker}: OK — every name is bound earlier")
    return 0


def selftest(source_path=SOURCE, function_name=FUNCTION):
    """Prove the audit catches the bug it was written for.

    The mutant is the real source with the top-of-chat() initialisation removed —
    exactly the state this đợt shipped briefly, where `_answered` (and `_plan`) were
    first assigned hundreds of lines below the soft-deadline branch that reads
    them. A guard that cannot fail is not a guard, so this is asserted, not assumed.
    """
    source = io.open(source_path, encoding="utf-8").read()
    marker = '_partial_note = ""'
    lines = source.splitlines()
    if not any(marker in line for line in lines):
        print("[SELFTEST] SKIP — the audited marker is not where the test expects it")
        return 1
    # Strip EVERY `_answered = {...}` binding that happens BEFORE the soft-deadline
    # marker — i.e. the early initialisation in full, whichever line it sits on.
    cut = next(i for i, line in enumerate(lines) if marker in line)
    kept = [line for i, line in enumerate(lines)
            if not (i < cut and line.strip() == '_answered = {"provider": "", "model": ""}')]
    mutagen = os.path.join(HERE, "_mutant_main.py")
    try:
        with io.open(mutagen, "w", encoding="utf-8") as handle:
            handle.write("\n".join(kept) + "\n")
        caught = audit(mutagen, function_name, marker)
    finally:
        if os.path.exists(mutagen):
            os.remove(mutagen)
    print(f"[SELFTEST] the audit {'CAUGHT the removed initialisation (good)' if caught else 'MISSED it'}")
    return 0 if caught else 1


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    if "--debug" in sys.argv:
        _src = io.open(SOURCE, encoding="utf-8").read()
        _marker_line = next(i + 1 for i, l in enumerate(_src.splitlines())
                            if '_partial_note = ""' in l)
        _tree = ast.parse(_src)
        _fn = [n for n in ast.walk(_tree)
               if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == FUNCTION][0]
        for _n in ast.walk(_fn):
            if isinstance(_n, ast.Name) and _n.id == "_answered":
                print(f"  _answered {type(_n.ctx).__name__} at line {_n.lineno} "
                      f"(soft-deadline block starts at {_marker_line})")
        sys.exit(0)
    codes = [
        audit(SOURCE, FUNCTION, '_partial_note = ""'),
        audit(SOURCE, FUNCTION, "mathviz_contract.normalize_geometry_2d"),
        audit(SOURCE, FUNCTION, "_gen_left = _budget.clamp(_gen_budget)"),
    ]
    sys.exit(1 if any(codes) else 0)