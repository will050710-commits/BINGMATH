import sys
import os
import json
import re
import numpy as np
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import imageio_ffmpeg

# Configure Matplotlib to use imageio-ffmpeg executable directly
plt.rcParams['animation.ffmpeg_path'] = imageio_ffmpeg.get_ffmpeg_exe()

def safe_draw_text(ax, x, y, text, **kwargs):
    if not text:
        return ax.text(x, y, "")
    
    cleaned_text = text
    if isinstance(cleaned_text, str):
        while "\\\\" in cleaned_text:
            cleaned_text = cleaned_text.replace("\\\\", "\\")
            
    try:
        return ax.text(x, y, cleaned_text, **kwargs)
    except Exception:
        fallback_text = text
        if isinstance(fallback_text, str):
            fallback_text = fallback_text.replace("\\^{circ}", "°").replace("\\^{+circ}", "°")
            fallback_text = fallback_text.replace("\\^circ", "°").replace("\\circ", "°")
            fallback_text = fallback_text.replace("\\^o", "°")
            fallback_text = fallback_text.replace("\\alpha", "α")
            fallback_text = fallback_text.replace("\\beta", "β")
            fallback_text = fallback_text.replace("\\gamma", "γ")
            fallback_text = fallback_text.replace("\\theta", "θ")
            fallback_text = fallback_text.replace("\\pi", "π")
            if fallback_text.startswith("$") and fallback_text.endswith("$"):
                fallback_text = fallback_text[1:-1]
            fallback_text = fallback_text.replace("\\", "")
            
        try:
            return ax.text(x, y, fallback_text, **kwargs)
        except Exception:
            return ax.text(x, y, "")

def render_canvas_instructions(instructions, output_path, duration=5.0, fps=15):
    # Determine bounds
    x_range = [-5, 5]
    y_range = [-5, 5]
    has_grid = False
    
    for inst in instructions:
        cmd = inst.get("cmd")
        if cmd == "setup":
            x_range = inst.get("xRange", [-5, 5])
            y_range = inst.get("yRange", [-5, 5])
        elif cmd == "grid":
            has_grid = True
            
    # Set up matplotlib figure
    fig, ax = plt.subplots(figsize=(6, 6), facecolor='#0f172a') # Slate-900
    ax.set_facecolor('#0f172a')
    
    # Configure axes limits
    ax.set_xlim(x_range[0], x_range[1])
    ax.set_ylim(y_range[0], y_range[1])
    
    # Configure grid
    if has_grid:
        ax.grid(True, which='both', color='#1e293b', linestyle=':', linewidth=0.8)
        
    # Configure axes lines
    ax.axhline(0, color='#64748b', linewidth=1.2, zorder=2) # X axis
    ax.axvline(0, color='#64748b', linewidth=1.2, zorder=2) # Y axis
    
    # Remove default spines
    for spine in ax.spines.values():
        spine.set_visible(False)
        
    # Set tick labels color
    ax.tick_params(colors='#64748b', labelsize=9)
    
    # Prepare animation elements
    frame_updates = []
    total_frames = int(duration * fps)
    
    for inst in instructions:
        cmd = inst.get("cmd")
        start_at = inst.get("startAt", 0.0)
        end_at = inst.get("endAt", 1.0)
        color = inst.get("color", "#ffffff")
        
        # Convert times to frame indices
        start_frame = int(start_at * total_frames)
        end_frame = int(end_at * total_frames)
        if end_frame <= start_frame:
            end_frame = start_frame + 1
            
        if cmd == "axes":
            xl = inst.get("xLabel", "")
            yl = inst.get("yLabel", "")
            # Draw labels
            x_lbl = safe_draw_text(ax, x_range[1] - (x_range[1]-x_range[0])*0.05, -(y_range[1]-y_range[0])*0.04, xl, color='#94a3b8', fontsize=10, ha='right', va='top', alpha=0)
            y_lbl = safe_draw_text(ax, (x_range[1]-x_range[0])*0.02, y_range[1] - (y_range[1]-y_range[0])*0.05, yl, color='#94a3b8', fontsize=10, ha='left', va='top', alpha=0)
            
            def make_update_axes(xl_obj, yl_obj, sf, ef):
                def update_axes(frame):
                    if frame >= sf:
                        progress = min(1.0, (frame - sf) / (ef - sf))
                        xl_obj.set_alpha(progress)
                        yl_obj.set_alpha(progress)
                return update_axes
            frame_updates.append(make_update_axes(x_lbl, y_lbl, start_frame, end_frame))
            
        elif cmd == "function":
            expr = inst.get("expr", "")
            if not expr:
                continue
            py_expr = expr.replace("Math.", "np.")
            py_expr = re.sub(r'\bt\b', 'x', py_expr)
            py_expr = py_expr.replace("^", "**")
            
            domain = inst.get("domain", [x_range[0], x_range[1]])
            label_text = inst.get("label", "")
            glow = inst.get("glow", True)
            
            # Prepare glow lines and main line
            lines = []
            if glow:
                # Outer glow
                l_outer, = ax.plot([], [], color=color, alpha=0.0, linewidth=7, zorder=3)
                # Inner glow
                l_inner, = ax.plot([], [], color=color, alpha=0.0, linewidth=4, zorder=3)
                lines.extend([l_outer, l_inner])
            
            l_main, = ax.plot([], [], color=color, alpha=0.0, linewidth=2, zorder=4)
            lines.append(l_main)
            
            # Label
            lbl = None
            if label_text:
                x_val = domain[1]
                try:
                    y_val = eval(py_expr, {"x": x_val, "np": np, "Math": np})
                    lbl = safe_draw_text(ax, x_val, y_val, "  " + label_text, color=color, fontsize=9, va='center', ha='left', alpha=0)
                except:
                    pass
            
            def make_update_fn(line_objs, label_obj, sf, ef, dom, expr_str):
                def update_fn(frame):
                    if frame >= sf:
                        progress = min(1.0, (frame - sf) / (ef - sf))
                        if progress <= 0:
                            return
                        x_end = dom[0] + (dom[1] - dom[0]) * progress
                        x_draw = np.linspace(dom[0], x_end, max(2, int(100 * progress)))
                        try:
                            y_draw = eval(expr_str, {"x": x_draw, "np": np, "Math": np})
                            for idx, l in enumerate(line_objs):
                                l.set_data(x_draw, y_draw)
                                if len(line_objs) > 1:
                                    if idx == 0: l.set_alpha(0.15)
                                    elif idx == 1: l.set_alpha(0.3)
                                    else: l.set_alpha(1.0)
                                else:
                                    l.set_alpha(1.0)
                        except Exception:
                            pass
                        
                        if progress >= 1.0 and label_obj:
                            label_obj.set_alpha(1.0)
                return update_fn
                
            frame_updates.append(make_update_fn(lines, lbl, start_frame, end_frame, domain, py_expr))
            
        elif cmd == "point":
            x = inst.get("x", 0)
            y = inst.get("y", 0)
            show_dot = inst.get("showDot", True)
            label_text = inst.get("label", "")
            
            dot_artist = None
            if show_dot:
                dot_artist, = ax.plot([x], [y], marker='o', color=color, markersize=6, alpha=0, zorder=5)
                
            lbl = None
            if label_text:
                lbl = safe_draw_text(ax, x + (x_range[1]-x_range[0])*0.02, y + (y_range[1]-y_range[0])*0.02, label_text, color=color, fontsize=9, alpha=0, zorder=6)
                
            def make_update_point(dot_obj, label_obj, sf):
                def update_point(frame):
                    if frame >= sf:
                        if dot_obj: dot_obj.set_alpha(1.0)
                        if label_obj: label_obj.set_alpha(1.0)
                return update_point
            frame_updates.append(make_update_point(dot_artist, lbl, start_frame))
            
        elif cmd == "line":
            p1 = inst.get("p1", [0, 0])
            p2 = inst.get("p2", [0, 0])
            dashed = inst.get("dashed", False)
            is_vector = inst.get("isVector", False)
            label_text = inst.get("label", "")
            
            line_obj, = ax.plot([], [], color=color, alpha=0, linestyle='--' if dashed else '-', linewidth=1.5 if dashed else 2, zorder=3)
            
            lbl = None
            if label_text:
                lbl = safe_draw_text(ax, (p1[0]+p2[0])/2, (p1[1]+p2[1])/2, label_text, color=color, fontsize=8, alpha=0, zorder=4, ha='center', va='bottom')
                
            def make_update_line(l_artist, label_obj, sf, ef, pt1, pt2):
                def update_line(frame):
                    if frame >= sf:
                        progress = min(1.0, (frame - sf) / (ef - sf))
                        if progress <= 0:
                            return
                        x_curr = pt1[0] + (pt2[0] - pt1[0]) * progress
                        y_curr = pt1[1] + (pt2[1] - pt1[1]) * progress
                        l_artist.set_data([pt1[0], x_curr], [pt1[1], y_curr])
                        l_artist.set_alpha(0.8 if dashed else 1.0)
                        if progress >= 1.0 and label_obj:
                            label_obj.set_alpha(1.0)
                return update_line
            frame_updates.append(make_update_line(line_obj, lbl, start_frame, end_frame, p1, p2))
            
        elif cmd == "text":
            x = inst.get("x", 0)
            y = inst.get("y", 0)
            text_val = inst.get("text", "")
            size = inst.get("size", 10)
            
            lbl = safe_draw_text(ax, x, y, text_val, color=color, fontsize=size, alpha=0, zorder=4, ha='center', va='center')
            
            def make_update_text(lbl_obj, sf):
                def update_text(frame):
                    if frame >= sf:
                        if lbl_obj:
                            lbl_obj.set_alpha(1.0)
                return update_text
            frame_updates.append(make_update_text(lbl, start_frame))
            
        elif cmd == "shape":
            shape_type = inst.get("type")
            fill = inst.get("fill", True)
            
            if shape_type == "rect":
                w = inst.get("w", 1.0)
                h = inst.get("h", 1.0)
                x = inst.get("x", 0.0)
                y = inst.get("y", 0.0)
                patch = plt.Rectangle((x - w/2, y - h/2), w, h, edgecolor=color, facecolor=color if fill else 'none', alpha=0, fill=fill, zorder=3)
                ax.add_patch(patch)
                def make_update_shape(p_obj, sf, ef):
                    def update_shape(frame):
                        if frame >= sf:
                            progress = min(1.0, (frame - sf) / (ef - sf))
                            p_obj.set_alpha(0.3 * progress if fill else progress)
                    return update_shape
                frame_updates.append(make_update_shape(patch, start_frame, end_frame))
                
            elif shape_type == "circle":
                r = inst.get("r", 1.0)
                x = inst.get("x", 0.0)
                y = inst.get("y", 0.0)
                patch = plt.Circle((x, y), r, edgecolor=color, facecolor=color if fill else 'none', alpha=0, fill=fill, zorder=3)
                ax.add_patch(patch)
                def make_update_shape(p_obj, sf, ef):
                    def update_shape(frame):
                        if frame >= sf:
                            progress = min(1.0, (frame - sf) / (ef - sf))
                            p_obj.set_alpha(0.3 * progress if fill else progress)
                    return update_shape
                frame_updates.append(make_update_shape(patch, start_frame, end_frame))
                
            elif shape_type == "triangle":
                p1 = inst.get("p1", [0.0, 0.0])
                p2 = inst.get("p2", [1.0, 0.0])
                p3 = inst.get("p3", [0.5, 1.0])
                patch = plt.Polygon([p1, p2, p3], edgecolor=color, facecolor=color if fill else 'none', alpha=0, fill=fill, zorder=3)
                ax.add_patch(patch)
                def make_update_shape(p_obj, sf, ef):
                    def update_shape(frame):
                        if frame >= sf:
                            progress = min(1.0, (frame - sf) / (ef - sf))
                            p_obj.set_alpha(0.3 * progress if fill else progress)
                    return update_shape
                frame_updates.append(make_update_shape(patch, start_frame, end_frame))
                
            elif shape_type == "polygon":
                pts = inst.get("points", [])
                if pts:
                    patch = plt.Polygon(pts, edgecolor=color, facecolor=color if fill else 'none', alpha=0, fill=fill, zorder=3)
                    ax.add_patch(patch)
                    def make_update_shape(p_obj, sf, ef):
                        def update_shape(frame):
                            if frame >= sf:
                                progress = min(1.0, (frame - sf) / (ef - sf))
                                p_obj.set_alpha(0.3 * progress if fill else progress)
                        return update_shape
                    frame_updates.append(make_update_shape(patch, start_frame, end_frame))
                    
            elif shape_type == "petal_tile":
                cx = inst.get("x", 2.0)
                cy = inst.get("y", 2.0)
                size = inst.get("size", 4.0)
                half = size / 2.0
                # Nền gạch trắng có viền mỏng
                bg_patch = plt.Rectangle((cx - half, cy - half), size, size, edgecolor="#374151", facecolor="#f8f8f8", fill=True, zorder=2)
                bg_patch.set_alpha(0.0)
                ax.add_patch(bg_patch)
                
                petals = []
                quadrants = [(1, 1), (-1, 1), (-1, -1), (1, -1)]
                for sx, sy in quadrants:
                    pts = []
                    # Arc A
                    for i in range(31):
                        u = i / 30.0
                        px = sx * u * half
                        py = sy * u * u * half
                        pts.append((cx + px, cy + py))
                    # Arc B
                    for i in range(30, -1, -1):
                        u = i / 30.0
                        py = sy * u * half
                        px = sx * u * u * half
                        pts.append((cx + px, cy + py))
                    
                    petal_patch = plt.Polygon(pts, facecolor="#2a2a2a", edgecolor="#2a2a2a", fill=True, zorder=3)
                    petal_patch.set_alpha(0.0)
                    ax.add_patch(petal_patch)
                    petals.append(petal_patch)
                    
                def make_update_petal_tile(bg, p_patches, sf, ef):
                    def update_petal_tile(frame):
                        if frame >= sf:
                            progress = min(1.0, (frame - sf) / (ef - sf))
                            bg.set_alpha(progress)
                            for idx, p_patch in enumerate(p_patches):
                                petal_progress = min(1.0, max(0.0, (progress - 0.2 - idx * 0.08) / 0.5))
                                p_patch.set_alpha(petal_progress)
                    return update_petal_tile
                frame_updates.append(make_update_petal_tile(bg_patch, petals, start_frame, end_frame))
                
        elif cmd == "camera":
            target_x = inst.get("targetX", x_range[0] + (x_range[1]-x_range[0])/2)
            target_y = inst.get("targetY", y_range[0] + (y_range[1]-y_range[0])/2)
            zoom = inst.get("zoom", 1.0)
            
            orig_w = x_range[1] - x_range[0]
            orig_h = y_range[1] - y_range[0]
            target_w = orig_w / zoom
            target_h = orig_h / zoom
            
            x_target_lim = [target_x - target_w/2, target_x + target_w/2]
            y_target_lim = [target_y - target_h/2, target_y + target_h/2]
            
            def make_update_camera(sf, ef, xt_lim, yt_lim):
                def update_camera(frame):
                    if frame >= sf:
                        progress = min(1.0, (frame - sf) / (ef - sf))
                        t = progress * progress * (3 - 2 * progress)
                        curr_x_lim = [
                            x_range[0] + (xt_lim[0] - x_range[0]) * t,
                            x_range[1] + (xt_lim[1] - x_range[1]) * t
                        ]
                        curr_y_lim = [
                            y_range[0] + (yt_lim[0] - y_range[0]) * t,
                            y_range[1] + (yt_lim[1] - y_range[1]) * t
                        ]
                        ax.set_xlim(curr_x_lim)
                        ax.set_ylim(curr_y_lim)
                return update_camera
            frame_updates.append(make_update_camera(start_frame, end_frame, x_target_lim, y_target_lim))

    def animate(frame):
        for update_fn in frame_updates:
            update_fn(frame)
        return []
        
    writer = animation.FFMpegWriter(fps=fps, codec='libx264', extra_args=['-pix_fmt', 'yuv420p'])
    ani = animation.FuncAnimation(fig, animate, frames=total_frames, interval=1000/fps)
    ani.save(output_path, writer=writer)
    plt.close(fig)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python canvas_to_video.py <json_instructions_string> <output_mp4_path>")
        sys.exit(1)
        
    json_str = sys.argv[1]
    out_path = sys.argv[2]
    
    try:
        instrs = json.loads(json_str)
        render_canvas_instructions(instrs, out_path)
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)
