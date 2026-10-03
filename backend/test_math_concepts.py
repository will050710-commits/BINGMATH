"""
test_math_concepts.py
=====================
R1 of DUOMATH_HYBRIDRAG_PLAN.md — the concept graph moved out of main.py, and
this suite is the reason it was worth moving.

What is asserted
----------------
1. **Structure** — 27 nodes / 22 edges (the numbers /api/health advertises; 13 / 10
   before R5), every node carries the seven required fields, every node's `id` matches
   its dict key, every edge resolves to a real node and is not duplicated.
2. **Entity matching is unchanged** — `find_entities()` returns exactly the ids the
   pre-move `extract_graph_entities()` returned, for 20 golden queries. This is
   what protects widget routing (`GRAPHABLE_CONCEPT_IDS`) from shifting.
3. **The rendered block is unchanged** — `render_context()` matches the pre-move
   `retrieve_math_context()` output for the same 20 queries, compared against a
   snapshot captured from the OLD code via AST extraction (never `import main`).
4. **The one deliberate change is a FIX, and it is pinned** — the neighbour block
   was rendered from a `set`, so it permuted between processes (measured: 9 of 20
   queries). It is now stable. The golden comparison canonicalises ONLY that block,
   and a child process with a different PYTHONHASHSEED must produce identical bytes.
5. **main.py still wires it** — read as SOURCE (the CI job never imports main.py:
   importing it binds DB tables, reads .env and builds provider clients).

Run:  python backend/test_math_concepts.py
"""

import hashlib
import io
import json
import os
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import math_concepts  # noqa: E402

GOLDEN_PATH = os.path.join(HERE, "tests", "math_concepts_golden.json")
MAIN_PATH = os.path.join(HERE, "main.py")
DATA_PATH = os.path.join(HERE, "data", "math_concepts.json")

#: The numbers /api/health publishes. If the graph grows, these change WITH the
#: health endpoint — never one without the other. R5 added 14 nodes (geometry /
#: Olympiad concepts + the two classical inequalities) and 12 edges between them.
EXPECTED_NODES = 27
EXPECTED_EDGES = 22

#: The pre-R5 graph. Every golden snapshot was captured from these 13 nodes, and a
#: node's rendered block includes EVERY edge touching it - so an R5 edge attached to
#: one of these would silently change a block the golden test pins byte-for-byte.
ORIGINAL_NODES = frozenset({
    "phuong_trinh_bac_hai", "biet_thuc_delta", "he_thuc_vi_et", "dao_ham", "cuc_tri",
    "tiem_can", "tich_phan", "gioi_han", "xac_suat", "to_hop_chinh_hop",
    "ham_so_luong_giac", "so_phuc", "hinh_hoc_khong_gian"})
ORIGINAL_EDGES = 10

#: The R5 additions, so a rename or an accidental delete is caught by id.
R5_NODES = (
    "truc_tam", "phuong_tich", "truc_dang_phuong", "duong_thang_euler",
    "duong_tron_chin_diem", "duong_thang_simson", "tu_giac_dieu_hoa",
    "hang_diem_dieu_hoa", "phep_nghich_dao", "dinh_ly_ceva", "dinh_ly_menelaus",
    "dinh_ly_ptolemy", "bat_dang_thuc_cosi", "bat_dang_thuc_bunhiacopxki")

NEIGHBOUR_HEADER = "**Khái niệm lân cận liên quan:**"
GLOBAL_HEADER = "=== GLOBAL CONTEXT ==="

checks = 0
failures = []


def check(label, condition, detail=""):
    global checks
    checks += 1
    if condition:
        print(f"  ok   {label}")
    else:
        failures.append(label)
        print(f"  FAIL {label} {detail}")


def canonical(text):
    """Sort the neighbour block's lines, leave everything else byte-exact.

    Why this is legitimate rather than convenient: the pre-move renderer built that
    block from a `set`, so its line order was already random per process. Comparing
    it sorted is comparing the CONTENT the old code actually guaranteed. Every other
    byte of the block is compared exactly.
    """
    lines = text.split("\n")
    out, neighbour, inside = [], [], False
    for line in lines:
        if line.startswith(NEIGHBOUR_HEADER):
            inside = True
            out.append(line)
            continue
        if inside:
            if line.startswith(GLOBAL_HEADER):
                inside = False
                out.extend(sorted(neighbour))
                neighbour = []
                out.append(line)
                continue
            neighbour.append(line)
            continue
        out.append(line)
    if neighbour:
        out.extend(sorted(neighbour))
    return "\n".join(out)


def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


with io.open(GOLDEN_PATH, encoding="utf-8") as fh:
    GOLDEN = json.load(fh)
QUERIES = GOLDEN["queries"]
OLD_CONTEXT = GOLDEN["context"]
OLD_ENTITIES = GOLDEN["entities"]


# ── 1. structure ─────────────────────────────────────────────────────────────

def test_structure():
    print("\n[structure] graph shape and referential integrity")
    nodes = math_concepts.nodes()
    edges = math_concepts.edges()

    check(f"the graph has {EXPECTED_NODES} nodes (the number /api/health advertises)",
          len(nodes) == EXPECTED_NODES, f"got {len(nodes)}")
    check(f"the graph has {EXPECTED_EDGES} edges (the number /api/health advertises)",
          len(edges) == EXPECTED_EDGES, f"got {len(edges)}")

    missing = [f"{k}.{field}" for k, n in nodes.items()
               for field in math_concepts.NODE_KEYS if field not in n]
    check("every node carries all seven required fields", not missing, str(missing[:5]))

    mismatched = [k for k, n in nodes.items() if n.get("id") != k]
    check("every node's `id` matches its dict key", not mismatched, str(mismatched[:5]))

    dangling = [f"{e['source']}->{e['target']}" for e in edges
                if e["source"] not in nodes or e["target"] not in nodes]
    check("every edge endpoint resolves to a real node", not dangling, str(dangling[:5]))

    bad_edges = [e for e in edges if not str(e.get("relation", "")).strip()]
    check("every edge carries a relation sentence", not bad_edges, str(bad_edges[:2]))

    pairs = [(e["source"], e["target"]) for e in edges]
    check("no duplicated edge", len(pairs) == len(set(pairs)))

    empty_kw = [k for k, n in nodes.items() if not n.get("keywords")]
    check("every node has at least one keyword (routing depends on it)",
          not empty_kw, str(empty_kw))

    # The JSON on disk IS the source of truth, so loading it directly must agree.
    with io.open(DATA_PATH, encoding="utf-8") as fh:
        on_disk = json.load(fh)
    check("the module's GRAPH equals backend/data/math_concepts.json",
          on_disk == math_concepts.GRAPH)


# ── 2. entity matching ───────────────────────────────────────────────────────

def test_entities():
    print("\n[entities] find_entities() must return exactly what the old matcher did")
    wrong = []
    for q in QUERIES:
        got = math_concepts.find_entities(q)
        if got != OLD_ENTITIES[q]:
            wrong.append((q, OLD_ENTITIES[q], got))
    check(f"all {len(QUERIES)} golden queries match the pre-move entity lists",
          not wrong, str(wrong[:2]))

    check("an off-topic query matches nothing",
          math_concepts.find_entities("cách nấu phở bò ngon tại nhà") == [])
    check("a short ASCII keyword needs a word boundary ('sin' not inside another word)",
          "ham_so_luong_giac" not in math_concepts.find_entities("using something"))
    check("a short ASCII keyword still matches on its own ('lim')",
          "gioi_han" in math_concepts.find_entities("lim x->0 sinx/x"))
    check("the English name is matched too",
          math_concepts.find_entities("Quadratic Equation solve") == ["phuong_trinh_bac_hai"])
    deduped = math_concepts.find_entities("xác suất và tổ hợp và xác suất")
    check("results are deduped and order-preserved", len(deduped) == len(set(deduped)))

    check("neighbors() resolves every id it returns",
          all(n["node"] in math_concepts.nodes() for n in math_concepts.neighbors("dao_ham")))
    check("neighbors('dao_ham') reports both directions",
          {n["direction"] for n in math_concepts.neighbors("dao_ham")} == {"in", "out"})


# ── 3. the rendered reference block ──────────────────────────────────────────

def test_render_golden():
    print("\n[render] render_context() vs the pre-move retrieve_math_context()")
    wrong = []
    for q in QUERIES:
        got = math_concepts.render_context(q)
        if canonical(got) != canonical(OLD_CONTEXT[q]):
            wrong.append(q)
    check(f"all {len(QUERIES)} golden queries render the same block "
          f"(neighbour lines compared as a set, everything else byte-exact)",
          not wrong, str(wrong[:3]))

    # The one behaviour change must be confined to the neighbour block.
    permuted = [q for q in QUERIES if math_concepts.render_context(q) != OLD_CONTEXT[q]]
    check("where content differs from the snapshot it is ONLY a line permutation",
          all(sorted(math_concepts.render_context(q).split("\n"))
              == sorted(OLD_CONTEXT[q].split("\n")) for q in permuted),
          f"{len(permuted)} queries reordered")

    print("\n[render] block shape")
    empty = math_concepts.render_context("cách nấu phở bò ngon tại nhà")
    check("a query with no concept gets the Global block only",
          empty.startswith(GLOBAL_HEADER) and "Local Mode" not in empty)
    check("the Global block states the three house rules",
          all(s in empty for s in ("tiếng Việt", "LaTeX", "Socratic")))
    check("the block is terminated by the 50-char rule",
          empty.rstrip("\n").endswith("=" * 50))

    hit = math_concepts.render_context("tính đạo hàm của hàm số f(x)")
    check("a matched query gets the Local header",
          hit.startswith("=== KNOWLEDGE GRAPH (Local Mode) ==="))
    check("the node card carries name + definition + formulas + example",
          all(s in hit for s in ("### 📚", "**Định nghĩa:**", "**Công thức:**", "**Ví dụ:**")))
    check("the edge relations are rendered", "**Quan hệ trong Knowledge Graph:**" in hit)
    check("the neighbour block is rendered", NEIGHBOUR_HEADER in hit)


# ── 4. determinism (the defect this move fixed) ──────────────────────────────

DETERMINISM_PROBE = r'''
import hashlib, io, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import math_concepts
with io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "tests", "math_concepts_golden.json"), encoding="utf-8") as fh:
    queries = json.load(fh)["queries"]
out = {q: hashlib.sha256(math_concepts.render_context(q).encode("utf-8")).hexdigest()[:16]
       for q in queries}
sys.stdout.write(json.dumps(out, ensure_ascii=True))
'''


def test_determinism():
    print("\n[determinism] the same query must render the same bytes in another process")
    probe = os.path.join(HERE, "_probe_determinism.py")
    env = dict(os.environ, PYTHONHASHSEED="12345", PYTHONIOENCODING="utf-8")
    try:
        with io.open(probe, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(DETERMINISM_PROBE)
        run = subprocess.run([sys.executable, "-B", probe],
                             capture_output=True, text=True, env=env, encoding="utf-8")
        check("the child process ran", run.returncode == 0, (run.stderr or "")[-200:])
        if run.returncode == 0:
            child = json.loads(run.stdout.strip())
            differing = [q for q in QUERIES
                         if child[q] != sha(math_concepts.render_context(q))]
            check("0 of 20 queries differ across processes (was 9 of 20 before the fix)",
                  not differing, str(differing[:3]))
    finally:
        if os.path.exists(probe):
            os.remove(probe)

    recorded = GOLDEN.get("determinism_probe") or {}
    check("the snapshot records HOW MANY queries used to be unstable",
          recorded.get("n_neighbour_blocks_multi", 0) > 0, "no measurement captured")
    check("the snapshot proves the old instability was a permutation, not lost content",
          recorded.get("neighbour_permutation_only") is True)


# ── 5. main.py still wires the module ────────────────────────────────────────

def test_main_wiring():
    print("\n[wiring] main.py delegates instead of holding the graph")
    with io.open(MAIN_PATH, encoding="utf-8") as fh:
        main = fh.read()

    check("main.py imports the module", "import math_concepts" in main)
    check("MATH_CONCEPT_GRAPH is now the module's graph",
          "MATH_CONCEPT_GRAPH = math_concepts.GRAPH" in main)
    check("extract_graph_entities is the module's matcher",
          "extract_graph_entities = math_concepts.find_entities" in main)
    check("retrieve_math_context delegates the rendering",
          "return math_concepts.render_context(query)" in main)
    check("the lru_cache on the chat path is KEPT (caching semantics unchanged)",
          "@lru_cache(maxsize=128)\ndef retrieve_math_context" in main)
    check("the graph is no longer defined inside main.py",
          '"english_name": "Quadratic Equation"' not in main)
    check("the old private regex module alias went with it",
          "_re_rag" not in main)
    check("there is exactly one retrieve_math_context definition",
          main.count("def retrieve_math_context") == 1)

    # /api/health must still publish the same shape (the numbers come from the graph).
    check("health still publishes lightrag_nodes/lightrag_edges",
          '"lightrag_nodes"' in main and '"lightrag_edges"' in main)
    check("widget routing still reads the alias", "GRAPHABLE_CONCEPT_IDS" in main)


# ── 6. R5: the geometry / Olympiad nodes ─────────────────────────────────────

#: widget names the app can actually render (GRAPHABLE_CONCEPT_IDS values + the 2D
#: keyword route). A viz_template outside this set would name a figure nobody draws.
KNOWN_WIDGETS = {"geometry_2d", "geometry_3d", "function_plot", "unit_circle_wave",
                 "complex_plane", "distribution"}

#: (query, node that must be found, node that must NOT be found)
R5_QUERIES = (
    ("tính phương tích của điểm M đối với đường tròn", "phuong_tich", "truc_dang_phuong"),
    ("viết phương trình trục đẳng phương của hai đường tròn", "truc_dang_phuong", "phuong_tich"),
    ("chứng minh O, G, H thẳng hàng trên đường thẳng Euler", "duong_thang_euler", "duong_tron_chin_diem"),
    ("chứng minh đường tròn chín điểm đi qua trung điểm các cạnh", "duong_tron_chin_diem", "duong_thang_euler"),
    ("đường tròn Euler của tam giác", "duong_tron_chin_diem", "duong_thang_euler"),
    ("cho tam giác ABC nhọn có trực tâm H", "truc_tam", "duong_thang_euler"),
    ("tìm đường thẳng Simson của điểm P", "duong_thang_simson", "truc_tam"),
    ("chứng minh ABCD là tứ giác điều hoà", "tu_giac_dieu_hoa", "hang_diem_dieu_hoa"),
    ("chứng minh bốn điểm lập thành hàng điểm điều hòa", "hang_diem_dieu_hoa", "tu_giac_dieu_hoa"),
    ("tìm ảnh của đường tròn qua phép nghịch đảo tâm O", "phep_nghich_dao", "phuong_tich"),
    ("dùng định lý Ceva chứng minh ba đường đồng quy", "dinh_ly_ceva", "dinh_ly_menelaus"),
    ("áp dụng định lý Menelaus cho ba điểm thẳng hàng", "dinh_ly_menelaus", "dinh_ly_ceva"),
    ("định lý Ptolemy cho tứ giác nội tiếp", "dinh_ly_ptolemy", "tu_giac_dieu_hoa"),
    ("chứng minh bất đẳng thức Cô-si cho ba số dương", "bat_dang_thuc_cosi", "bat_dang_thuc_bunhiacopxki"),
    ("dùng bất đẳng thức Bunhiacopxki để tìm giá trị nhỏ nhất", "bat_dang_thuc_bunhiacopxki",
     "bat_dang_thuc_cosi"),
)


def test_r5_nodes():
    print("\n[R5] geometry / Olympiad nodes: reachable, isolated from the pinned subgraph, routing-neutral")
    import mathviz_contract
    nodes = math_concepts.nodes()
    edges = math_concepts.edges()

    check("all 14 R5 nodes exist by id", all(n in nodes for n in R5_NODES),
          str([n for n in R5_NODES if n not in nodes]))
    check("the 13 original nodes are all still present", ORIGINAL_NODES <= set(nodes))
    check("the graph is exactly original + R5 (nothing else crept in)",
          set(nodes) == ORIGINAL_NODES | set(R5_NODES),
          str(sorted(set(nodes) - ORIGINAL_NODES - set(R5_NODES))))

    touching_original = [e for e in edges
                         if e["source"] in ORIGINAL_NODES or e["target"] in ORIGINAL_NODES]
    check("only the original 10 edges touch an original node (golden blocks stay byte-exact)",
          len(touching_original) == ORIGINAL_EDGES,
          f"{len(touching_original)} edges touch the original subgraph")
    check("no R5 edge crosses between the original and the new nodes",
          all((e["source"] in ORIGINAL_NODES) == (e["target"] in ORIGINAL_NODES)
              for e in edges))
    check("every R5 node has at least one edge (it is part of the graph, not an island)",
          all(math_concepts.neighbors(n) for n in R5_NODES),
          str([n for n in R5_NODES if not math_concepts.neighbors(n)]))

    misses = []
    for query, must, must_not in R5_QUERIES:
        found = math_concepts.find_entities(query)
        if must not in found or must_not in found:
            misses.append((query, found))
    check(f"all {len(R5_QUERIES)} R5 queries find their own node and not the neighbouring one",
          not misses, str(misses[:2]))

    check("the matcher stays diacritic-sensitive (unaccented geometry still finds nothing)",
          math_concepts.find_entities("duong thang Euler va truc tam") == [])
    check("a bare 'euler' does not match the Euler-line node (it needs the full phrase)",
          "duong_thang_euler" not in math_concepts.find_entities("phương pháp euler giải gần đúng"))
    check("'nghịch đảo' alone (reciprocal in algebra) does not match inversion",
          "phep_nghich_dao" not in math_concepts.find_entities("tìm nghịch đảo của số phức z"))

    # viz fields: optional, but when present they must point at things that exist.
    with_viz = [n for n in R5_NODES if "viz_template" in nodes[n]]
    check("the 12 geometry nodes carry a viz_template; the 2 inequalities do not (no figure to draw)",
          len(with_viz) == 12 and not any("viz_template" in nodes[n]
                                          for n in ("bat_dang_thuc_cosi",
                                                    "bat_dang_thuc_bunhiacopxki")),
          str(len(with_viz)))
    check("every viz_template names a widget the app renders",
          all(nodes[n]["viz_template"] in KNOWN_WIDGETS for n in with_viz),
          str({nodes[n]["viz_template"] for n in with_viz}))
    check("every viz_layers entry is a kind in the MathViz contract (one vocabulary, not two)",
          all(set(nodes[n]["viz_layers"]) <= set(mathviz_contract.LAYER_KINDS) for n in with_viz),
          str([(n, sorted(set(nodes[n]["viz_layers"]) - set(mathviz_contract.LAYER_KINDS)))
               for n in with_viz]))
    check("the original nodes gained no viz field (their records are untouched)",
          not any("viz_template" in nodes[n] or "viz_layers" in nodes[n] for n in ORIGINAL_NODES))

    # Routing neutrality: widget routing reads GRAPHABLE_CONCEPT_IDS. If an R5 id were
    # added to it, "chứng minh ... trực tâm" would start routing through the graph
    # instead of the keyword path - a behaviour change that needs its own evidence.
    with io.open(MAIN_PATH, encoding="utf-8") as fh:
        main_src = fh.read()
    start = main_src.index("GRAPHABLE_CONCEPT_IDS: dict[str, str] = {")
    block = main_src[start:main_src.index("}", start)]
    check("no R5 node id is in GRAPHABLE_CONCEPT_IDS (widget routing is unchanged by R5)",
          not any(f'"{n}"' in block for n in R5_NODES))
    check("every widget in KNOWN_WIDGETS is mentioned by main.py (the set is not invented)",
          all(f'"{w}"' in main_src for w in KNOWN_WIDGETS))

    rendered = math_concepts.render_context("cho tam giác ABC nhọn có trực tâm H")
    node = nodes["truc_tam"]
    check("an R5 node renders through the same card as every other node",
          "### 📚 Trực tâm tam giác (Orthocenter)" in rendered and node["formulas"] in rendered)
    check("viz fields are NOT rendered into the prompt (they are metadata, not reference text)",
          "viz_template" not in rendered and "geometry_2d" not in rendered)


# ── run ──────────────────────────────────────────────────────────────────────

def main():
    test_structure()
    test_entities()
    test_render_golden()
    test_determinism()
    test_main_wiring()
    test_r5_nodes()

    print(f"\n{checks - len(failures)}/{checks} checks passed")
    if failures:
        print("FAILED:")
        for name in failures:
            print(f"  - {name}")
        return 1
    print("ALL_MATH_CONCEPTS_TESTS_PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())