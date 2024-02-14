//Obtener cookies para el csrftoken
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}


//ELIMINAR FORMULARIOS
function deleteForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.remove();
    }
}


function getFileInfo(divFileInfoId, inputId) {
    const div = document.getElementById(divFileInfoId);
    const input = document.getElementById(inputId);
    const urlFile = input.value;
    const csrftoken = getCookie('csrftoken');
    url = '/downloader/'

    console.log(div)
    div.style.display = 'none';
    
    data = {
        'url_file': urlFile,
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud de información.');
        }
        return response.json()
    })
    .then(response => {
        div.innerText = response['title']
        div.style.display = 'block'; 
    })
}

document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('allForms');
    const addFormBtn = document.getElementById('addFormBtn');
    const submitAllBtn = document.getElementById('submitAllBtn');
    let formCount = 0;


    //AÑADIR FORMULARIOS
    addFormBtn.addEventListener('click', function() {
        console.log("Asdasdasd")
        formCount++;
        const formHtml = `
        <div class="form-group flex-column align-items-center justify-content-center" id="${formCount}">
        <form id="form" class="dynamic-form">
            <div class="d-flex align-items-center">
                <i class="link-icon bi bi-link-45deg"></i>
                <input type="text" name="url" class="form-control" required>
                <div class="list-file-type" name="file_type">
                    <label class="file-type">
                        <input class="form-check-input" type="radio" name="file_type" value="audio" id="audioRadi" checked>
                        Audio
                    </label>
                    <label class="file-type">
                        <input class="form-check-input" type="radio" name="file_type" value="video" id="videoRadi">
                        Video
                    </label>
                </div>
                <button type="button" class="trash-button btn" onclick="deleteForm('${formCount}')"><i class="bi bi-trash3"></i></button>
                </div>
        </form>
        </div>
                `;
                formContainer.insertAdjacentHTML('beforeend', formHtml);
            });


    //ELIMINAR ARCHIVOS DEL SERVIDOR
    function removeFileFromServer(deleteFile) {
        const requestUrl = '/downloader/';
        const csrftoken = getCookie('csrftoken');
        const data = {
            'fileToDelete': deleteFile
        };

        fetch(requestUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken 
            },
            body: JSON.stringify(data)
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


    //ENVIO DE FORMULARIOS AL BACKEND
    submitAllBtn.addEventListener('click', function() {
        const forms = document.querySelectorAll('form');

        const requestUrl = '/downloader/';
        const csrftoken = getCookie('csrftoken');

        let errorDiv = document.getElementById('error-message');
        errorDiv.style.display = 'none'; 

        forms.forEach(form => {
            const formData = new FormData(form);
            data = {
                'url': formData.get('url'),
                'file_type': formData.get('file_type')
            };
            fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                responseHeaders = response.headers
                if (!response.ok) {
                    return response.json()
                }
                return response.blob();
            })
            .then(data => {

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

                    //Una vez que el archivo se envió al usuario, se elimina del servidor
                    URL.revokeObjectURL(blobUrl);
                    const deleteFile = responseHeaders.get('delete_file')
                    removeFileFromServer(deleteFile);
                }

            })
            .catch(error => {
                console.log("Ha ocurrido un error inesperado")
            });

            });
    });
})
