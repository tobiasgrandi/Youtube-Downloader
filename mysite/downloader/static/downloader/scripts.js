// script.js

document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('allForms');
    const addFormBtn = document.getElementById('addFormBtn');
    const submitAllBtn = document.getElementById('submitAllBtn');
    let formCount = 0;
  
    addFormBtn.addEventListener('click', function() {
      formCount++;
      const formHtml = `
        <div class="form-group">
          <form id="form" class="dynamic-form">
            <label for="url">URL del video:</label>
            <input type="text" name="url" class="form-control" required>
            <div class="list-file_type" name="file_type">
              <label class="list-group-item">
                <input class="form-check-input me-1" type="radio" name="file_type" value="audio" id="audioRadi" checked>
                Audio
                </label>
                <label class="list-group-item">
                <input class="form-check-input me-1" type="radio" name="file_type" value="video" id="videoRadi">
                Video
                </label>
                </div>
                </form>
                </div>
                `;
                formContainer.insertAdjacentHTML('beforeend', formHtml);
            });
            
    // Función para enviar el formulario al backend
    function getCookie(name) {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
    }

    function removeFileFromServer(deleteFile) {
        // Hacer una solicitud al backend para eliminar el archivo del servidor
        console.log(deleteFile)
        const requestUrl = '/downloader/';
        const csrftoken = getCookie('csrftoken');
        const formData = new FormData();
        formData.append("fileToDelete", deleteFile)

        fetch(requestUrl, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken 
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud para eliminar el archivo.');
            }
            console.log('Archivo eliminado del servidor')
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    submitAllBtn.addEventListener('click', function() {
        const forms = document.querySelectorAll('form');

        const requestUrl = '/downloader/';
        const csrftoken = getCookie('csrftoken');

        let errorDiv = document.getElementById('error-message');
        errorDiv.style.display = 'none'; 

        forms.forEach(form => {
            const formData = new FormData(form);
            fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken 
                },
                body: formData
            })
            .then(response => {
                responseHeaders = response.headers
                if (!response.ok) {
                    return response.json()
                }
                console.log("rayos")
                return response.blob();
            })
            .then(data => {
                console.log(data.error_message)
                if (data.error_message){ //Manejo el error, aquí data es un JSON
                    let errorDiv = document.getElementById('error-message');
                    errorDiv.innerText = data.error_message;
                    errorDiv.style.display = 'block'; // Muestra el div
                }
                else{ //Manejo la descarga del archivo, aquí data es un Blob

                    // Crear un objeto URL para el Blob
                    const blobUrl = URL.createObjectURL(data);
                    
                    // Crear un enlace <a> para iniciar la descarga del archivo
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = responseHeaders.get('title');
                    link.click();

                    URL.revokeObjectURL(blobUrl);
                    const fileDelete = responseHeaders.get('delete_file')
                    removeFileFromServer(fileDelete);
                }

            })
            .catch(error => {

            });

            });
    });
})
