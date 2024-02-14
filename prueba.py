from pytube import YouTube
from pytube.cli import on_progress

def custom_progress_callback(stream, chunk, bytes_remaining):
    # Calcula el porcentaje de la descarga completada
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    percent_complete = (bytes_downloaded / total_size) * 100
    print(f"Descarga al {percent_complete:.2f}% completada")

yt = YouTube('https://www.youtube.com/watch?v=AkHI6Xgbz8k', on_progress_callback=custom_progress_callback)

print(yt.author)
#audio = yt.streams.get_lowest_resolution()
#
#audio.download()
#print("(:")