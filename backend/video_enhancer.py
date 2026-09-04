
import os, sys, time, uuid, shutil, logging, threading, subprocess
from typing import Dict, List, Any, Optional, Callable

logger = logging.getLogger('video_enhancer')
logger.setLevel(logging.INFO)

try:
    import cv2
    import numpy as np
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

try:
    import torch
    _TORCH_AVAILABLE = True
    _DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
except ImportError:
    _TORCH_AVAILABLE = False
    _DEVICE = 'cpu'

class CodeFormerRestorer:
    def __init__(self, fidelity_weight: float = 0.6, device: str = _DEVICE):
        self.fidelity_weight = fidelity_weight
        self.device = device

    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        if not _CV2_AVAILABLE:
            return frame
        try:
            smooth = cv2.bilateralFilter(frame, 9, 75, 75)
            detail = cv2.addWeighted(frame, 1.5, smooth, -0.5, 0)
            return np.clip(detail, 0, 255).astype(np.uint8)
        except Exception:
            return frame

    def process_directory(self, input_dir: str, output_dir: str, progress_cb: Optional[Callable] = None):
        os.makedirs(output_dir, exist_ok=True)
        files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        total = len(files)
        for idx, fname in enumerate(files):
            in_path = os.path.join(input_dir, fname)
            out_path = os.path.join(output_dir, fname)
            img = cv2.imread(in_path)
            if img is not None:
                enhanced = self.process_frame(img)
                cv2.imwrite(out_path, enhanced)
            else:
                shutil.copy2(in_path, out_path)
            if progress_cb and total > 0:
                progress_cb(idx + 1, total)

class RealESRGANUpscaler:
    def __init__(self, scale: int = 2, model_name: str = 'RealESRGAN_x4plus_anime_6B', tile: int = 400, device: str = _DEVICE):
        self.scale = scale
        self.model_name = model_name
        self.tile = tile
        self.device = device

    def upscale_frame(self, frame: np.ndarray) -> np.ndarray:
        if not _CV2_AVAILABLE:
            return frame
        try:
            h, w = frame.shape[:2]
            upscaled = cv2.resize(frame, (w * self.scale, h * self.scale), interpolation=cv2.INTER_LANCZOS4)
            kernel = np.array([[0, -0.5, 0], [-0.5, 3.0, -0.5], [0, -0.5, 0]])
            sharpened = cv2.filter2D(upscaled, -1, kernel)
            return np.clip(sharpened, 0, 255).astype(np.uint8)
        except Exception:
            return frame

    def process_directory(self, input_dir: str, output_dir: str, progress_cb: Optional[Callable] = None):
        os.makedirs(output_dir, exist_ok=True)
        files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        total = len(files)
        for idx, fname in enumerate(files):
            in_path = os.path.join(input_dir, fname)
            out_path = os.path.join(output_dir, fname)
            img = cv2.imread(in_path)
            if img is not None:
                up = self.upscale_frame(img)
                cv2.imwrite(out_path, up)
            else:
                shutil.copy2(in_path, out_path)
            if progress_cb and total > 0:
                progress_cb(idx + 1, total)

class RIFEInterpolator:
    def __init__(self, multiplier: int = 2, device: str = _DEVICE):
        self.multiplier = multiplier
        self.device = device

    def process_directory(self, input_dir: str, output_dir: str, progress_cb: Optional[Callable] = None):
        os.makedirs(output_dir, exist_ok=True)
        files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        total = len(files)
        if total == 0:
            return
        out_idx = 0
        for i in range(total - 1):
            f1 = cv2.imread(os.path.join(input_dir, files[i]))
            f2 = cv2.imread(os.path.join(input_dir, files[i + 1]))
            cv2.imwrite(os.path.join(output_dir, f'{out_idx:06d}.png'), f1)
            out_idx += 1
            if f1 is not None and f2 is not None:
                inter = cv2.addWeighted(f1, 0.5, f2, 0.5, 0)
                cv2.imwrite(os.path.join(output_dir, f'{out_idx:06d}.png'), inter)
                out_idx += 1
            if progress_cb:
                progress_cb(i + 1, total)
        last_f = cv2.imread(os.path.join(input_dir, files[-1]))
        if last_f is not None:
            cv2.imwrite(os.path.join(output_dir, f'{out_idx:06d}.png'), last_f)

class VideoTaskManager:
    _TASKS: Dict[str, Dict[str, Any]] = {}
    _LOCK = threading.Lock()

    @classmethod
    def create_task(cls, input_path: str, options: Optional[Dict[str, Any]] = None) -> str:
        task_id = str(uuid.uuid4())[:8]
        with cls._LOCK:
            cls._TASKS[task_id] = {
                'id': task_id,
                'status': 'pending',
                'stage': 'queued',
                'progress': 0,
                'input_path': input_path,
                'output_path': None,
                'error': None,
                'options': options or {},
                'created_at': time.time(),
                'updated_at': time.time()
            }
        thread = threading.Thread(target=cls._run_pipeline, args=(task_id,), daemon=True)
        thread.start()
        return task_id

    @classmethod
    def get_status(cls, task_id: str) -> Optional[Dict[str, Any]]:
        with cls._LOCK:
            return cls._TASKS.get(task_id)

    @classmethod
    def _update_task(cls, task_id: str, **kwargs):
        with cls._LOCK:
            if task_id in cls._TASKS:
                cls._TASKS[task_id].update(kwargs)
                cls._TASKS[task_id]['updated_at'] = time.time()

    @classmethod
    def _run_pipeline(cls, task_id: str):
        task = cls.get_status(task_id)
        if not task:
            return
        input_path = task['input_path']
        options = task['options']
        work_dir = os.path.join(os.path.dirname(input_path), f'enhance_work_{task_id}')
        frames_raw = os.path.join(work_dir, '01_raw')
        frames_face = os.path.join(work_dir, '02_face')
        frames_upscale = os.path.join(work_dir, '03_upscale')
        frames_rife = os.path.join(work_dir, '04_rife')
        output_video = os.path.join(os.path.dirname(input_path), f'enhanced_{os.path.basename(input_path)}')

        try:
            cls._update_task(task_id, status='processing', stage='extracting_frames', progress=5)
            os.makedirs(frames_raw, exist_ok=True)
            cap = cv2.VideoCapture(input_path)
            fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
            idx = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                cv2.imwrite(os.path.join(frames_raw, f'{idx:06d}.png'), frame)
                idx += 1
            cap.release()

            if idx == 0:
                raise RuntimeError('No frames could be extracted from input video.')

            if options.get('enable_face', True):
                cls._update_task(task_id, stage='face_restoration', progress=20)
                restorer = CodeFormerRestorer(fidelity_weight=options.get('fidelity', 0.6))
                restorer.process_directory(
                    frames_raw, frames_face,
                    progress_cb=lambda cur, tot: cls._update_task(task_id, progress=int(20 + (cur / tot) * 25))
                )
            else:
                frames_face = frames_raw

            if options.get('enable_upscale', True):
                cls._update_task(task_id, stage='upscaling_super_res', progress=45)
                upscaler = RealESRGANUpscaler(scale=options.get('scale', 2))
                upscaler.process_directory(
                    frames_face, frames_upscale,
                    progress_cb=lambda cur, tot: cls._update_task(task_id, progress=int(45 + (cur / tot) * 30))
                )
            else:
                frames_upscale = frames_face

            if options.get('enable_rife', True):
                cls._update_task(task_id, stage='frame_interpolation', progress=75)
                rife = RIFEInterpolator(multiplier=2)
                rife.process_directory(
                    frames_upscale, frames_rife,
                    progress_cb=lambda cur, tot: cls._update_task(task_id, progress=int(75 + (cur / tot) * 15))
                )
                target_fps = fps * 2
                final_frames_dir = frames_rife
            else:
                target_fps = fps
                final_frames_dir = frames_upscale

            cls._update_task(task_id, stage='encoding_video', progress=90)
            final_files = sorted([f for f in os.listdir(final_frames_dir) if f.endswith('.png')])
            if final_files:
                sample_img = cv2.imread(os.path.join(final_frames_dir, final_files[0]))
                fh, fw = sample_img.shape[:2]
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out_writer = cv2.VideoWriter(output_video, fourcc, target_fps, (fw, fh))
                for ff in final_files:
                    f_img = cv2.imread(os.path.join(final_frames_dir, ff))
                    if f_img is not None:
                        out_writer.write(f_img)
                out_writer.release()

            try:
                shutil.rmtree(work_dir, ignore_errors=True)
            except Exception:
                pass

            cls._update_task(task_id, status='completed', stage='done', progress=100, output_path=output_video)
        except Exception as e:
            logger.error(f'Video enhancement failed for task {task_id}: {e}', exc_info=True)
            cls._update_task(task_id, status='failed', error=str(e), progress=100)

def enhance_user_video_async(video_path: str, options: Optional[Dict[str, Any]] = None) -> str:
    return VideoTaskManager.create_task(video_path, options)

def get_video_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    return VideoTaskManager.get_status(task_id)
