import json
import subprocess

def main():
    # Load initial file from git (version at 72a2c0d)
    initial_content = subprocess.check_output('git show 72a2c0d:ARCHITECTURE_AND_INFRASTRUCTURE.md', shell=True).decode('utf-8')
    current_content = initial_content.replace('\r\n', '\n')
    
    log_path = r'C:\Users\Latitude 7300\.gemini\antigravity-ide\brain\11434a7e-7b89-46c5-956a-7c9f9f1343bc\.system_generated\logs\transcript_full.jsonl'
    
    with open(log_path, encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if data.get('tool_calls'):
                for tc in data['tool_calls']:
                    args = tc.get('args', {})
                    target_file = args.get('TargetFile', '')
                    if 'ARCHITECTURE_AND_INFRASTRUCTURE.md' in target_file:
                        name = tc.get('name')
                        step = data.get('step_index', 0)
                        if name == 'write_to_file':
                            code_content = args.get('CodeContent', '').replace('\r\n', '\n')
                            current_content = code_content
                            print(f"Step {step}: write_to_file (new len={len(current_content)})")
                        elif name == 'replace_file_content':
                            target = args.get('TargetContent', '').replace('\r\n', '\n')
                            replacement = args.get('ReplacementContent', '').replace('\r\n', '\n')
                            count = current_content.count(target)
                            if count == 0:
                                print(f"Step {step}: WARNING replace_file_content target not found! Target preview: {repr(target[:100])}")
                            else:
                                current_content = current_content.replace(target, replacement)
                                print(f"Step {step}: replace_file_content (new len={len(current_content)})")
                        elif name == 'multi_replace_file_content':
                            chunks = args.get('ReplacementChunks', [])
                            print(f"Step {step}: multi_replace_file_content with {len(chunks)} chunks")
                            for chunk in chunks:
                                target = chunk.get('TargetContent', '').replace('\r\n', '\n')
                                replacement = chunk.get('ReplacementContent', '').replace('\r\n', '\n')
                                count = current_content.count(target)
                                if count == 0:
                                    print(f"  WARNING chunk target not found! Target preview: {repr(target[:100])}")
                                else:
                                    current_content = current_content.replace(target, replacement)
                            print(f"Step {step}: multi_replace_file_content finished (new len={len(current_content)})")

    # Save reconstructed file
    with open(r'c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\scratch\reconstructed_perfect.md', 'w', encoding='utf-8') as outf:
        outf.write(current_content)
    print("Saved perfect reconstruction to scratch/reconstructed_perfect.md")

if __name__ == '__main__':
    main()
