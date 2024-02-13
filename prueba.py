from pytube import YouTube

yt = YouTube('https://www.youtube.com/watch?v=CnuFA6PkOT8')

audio = yt.streams.filter(mime_type="audio/mp4").order_by('abr').desc().first()

audio.download()