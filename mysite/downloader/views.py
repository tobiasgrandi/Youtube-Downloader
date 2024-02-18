from django.shortcuts import render
from pytube import YouTube, exceptions
from django.http import JsonResponse
from django.views import View
from django.http import FileResponse
import os
import json

# Create your views here.


class Download(View):

    def get(self, request):
        return render(request, 'downloader/index.html')
    
    def post(self, request):
        data = json.loads(request.body)
        if 'url' in data:
            return self.download(data)
        elif 'url_file' in data:
            url = data.get('url_file')
            yt = YouTube(url)
            return JsonResponse({'title': yt.title})

    def delete(self, request):
        return delete_file(request)

    def download(self, data):
        url = data.get('url')
        file_type = data.get('file_type')
        try:
            yt = YouTube(url)
            if file_type == 'audio':
                response = download_audio(yt)
            elif file_type == 'video':
                response = download_video(yt)
            else:
                error_message = "Error en la solicitud, el tipo de archivo no existe"
                return JsonResponse({'error_message': error_message})
            
            response["title"] = f"{yt.title}.mp4"
            return response
        except exceptions.RegexMatchError as e:
            error_message = f'Error al descargar el archivo: el link proporcionado es erróneo'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.AgeRestrictedError as e:
            error_message = f'Error al descargar el archivo: el contenido posee restricción de edad'
            return JsonResponse({'error_message': error_message}, status=500)
        except (exceptions.ExtractError, exceptions.HTMLParseError, exceptions.MaxRetriesExceeded, exceptions.RecordingUnavailable) as e:
            error_message = f'Error al descargar el archivo: no fue posible descargar el contenido'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.LiveStreamError as e:
            error_message = f'Error al descargar el archivo: el contenido es un video en vivo'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.MembersOnly as e:
            error_message = f'Error al descargar el archivo: el contenido solo es accesible para miembros'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.VideoPrivate as e:
            error_message = f'Error al descargar el archivo: el contenido es privado'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.VideoRegionBlocked as e:
            error_message = f'Error al descargar el archivo: el contenido se encuentra restringido en tu región'
            return JsonResponse({'error_message': error_message}, status=500)
        except exceptions.VideoUnavailable as e:
            error_message = f'Error al descargar el archivo: el contenido no se encuentra disponible'
            return JsonResponse({'error_message': error_message}, status=500)
        except Exception as e:
            error_message = f'Ha ocurrido un error inesperado: {e}'
            return JsonResponse({'error_message': error_message}, status=500)



def download_video(yt):
    video = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
    video_file = video.download()
    # Devolver el archivo como una respuesta HTTP
    response = FileResponse(open(video_file, 'rb'), content_type='video/mp4')
    response['Content-Disposition'] = f'attachment; filename="{yt.title}.mp4"'
    response['delete_file'] = video_file
    return response

def download_audio(yt):
    audio = yt.streams.filter(mime_type="audio/mp4").order_by('abr').desc().first()
    audio_file = audio.download()

    # Devolver el archivo como una respuesta HTTP
    response = FileResponse(open(audio_file, 'rb'), content_type='audio/mp4')
    response['Content-Disposition'] = f'attachment; filename="{yt.title}.mp4"'
    response['delete_file'] = audio_file
    return response

def delete_file(request):
    data = json.loads(request.body)
    file_path = data.get('fileToDelete')
    if os.path.exists(file_path):
        os.remove(file_path)
        return JsonResponse({'message': 'Archivo eliminado correctamente'})
    else:
        error_message = "Error al eliminar el archivo del servidor"
        return JsonResponse({'error_message': error_message})
