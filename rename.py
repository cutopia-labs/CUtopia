import os

AUDIO_EXTENSIONS = ['.scss']

def get_audio_files(path: str, is_dir=True):
    audio_files = []
    if is_dir:
        for f in os.listdir(path):
            name, ext = os.path.splitext(f)
            if ext in AUDIO_EXTENSIONS:
                parts = name.split('. ')
                os.rename(os.path.join(path, f), os.path.join(path, f"{parts[0]}.module.scss"))
    return audio_files


get_audio_files('billboard')