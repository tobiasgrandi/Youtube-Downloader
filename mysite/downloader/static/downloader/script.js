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

//CAMBIAR ÍCONO DE TIPO DE ARCHIVO
function changeFileIcon(id){
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;
    numId = id.split('_')[1];
    if (id.includes('audioRadi')) { 
        icon.classList.remove('bi-file-music')
        icon.classList.add('bi-file-music-fill')
        const videoInput = document.getElementById(`videoRadi_${numId}`)
        const videoIcon = videoInput.nextElementSibling;
        videoIcon.classList.remove('bi-camera-reels-fill')
        videoIcon.classList.add('bi-camera-reels')
    }
    else {
        icon.classList.remove('bi-camera-reels')
        icon.classList.add('bi-camera-reels-fill')
        const audioInput = document.getElementById(`audioRadi_${numId}`)
        const audioIcon = audioInput.nextElementSibling;
        audioIcon.classList.remove('bi-file-music-fill')
        audioIcon.classList.add('bi-file-music')
    }
}

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

//HABILITAR LOS BOTONES AÑADIR CAMPO Y DESCARGA
function enableButtons(){
    submitAllBtn = document.getElementById('submitAllBtn')
    addFormBtn = document.getElementById('addFormBtn')
    submitAllBtn.disabled = false
    addFormBtn.disabled = false
}

//DESHABILITAR LOS BOTONES AÑADIR CAMPO Y DESCARGA
function disableButtons(){
    submitAllBtn = document.getElementById('submitAllBtn')
    addFormBtn = document.getElementById('addFormBtn')
    submitAllBtn.disabled = true
    addFormBtn.disabled = true
}

//MOSTRAR BOTON TRASH OCULTAR SPINNER
function showTrashHideSpinner(form) {
    const trashButton = form.querySelector('Button');
    const loadSpinner = form.querySelector('.spinner-border');
    trashButton.style.display = 'block';
    loadSpinner.style.display = 'none';
}

//OCULTAR BOTON TRASH MOSTRAR SPINNER
function hideTrashShowSpinner(form) {
    const trashButton = form.querySelector('Button');
    const loadSpinner = form.querySelector('.spinner-border');
    trashButton.style.display = 'none';
    loadSpinner.style.display = 'inline-flex';
}

//MOSTRAR PRIMER BOTON TRASH Y OCULTAR SU LOAD SPINNER
function showFirstTrashButton(){
    const firstTrashButton = document.getElementById('trashButton_0');
    const firstLoadSpinner = document.getElementById('loadSpinner_0')
    firstLoadSpinner.style.display = 'none';
    firstTrashButton.style.display = 'block';
}

//MOSTRAR DIV CON ERROR
function changeErrorStatus(divId, data = null){
    let errorDiv = document.getElementById(divId);

    if (data) {// Muestra el div
        errorDiv.innerText = data.error_message;
        errorDiv.style.display = 'block';
        
    }
    else{// Oculta el div
        errorDiv.style.display = 'none'
    }
}

//DESCARGAR ARCHIVO EN EL NAVEGADOR
function downloadFile(data){
    // Crear un objeto URL para el Blob
    const blobUrl = URL.createObjectURL(data);
    // Crear un enlace <a> para iniciar la descarga del archivo
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = responseHeaders.get('title');
    link.click();
    //Una vez que el archivo se envió al usuario, se elimina del servidor
    URL.revokeObjectURL(blobUrl);
}

//ELIMINAR DIV CON EL FORMULARIO
function deleteDivForm(form) {
    if (form.parentElement.id) { //Si el contenedor padre tiene id, NO es el primer formulario
        const divFormId = form.parentElement.id;
        deleteForm(divFormId)
    }
    else {
        var input = form.querySelector("input[type=text]");
        var divFileInfo = form.querySelector(".file-info-show")
        if (input) {
            input.value = ""; // Eliminar el texto del input
            divFileInfo.classList.remove('file-info-show')
            divFileInfo.classList.add('file-info')
        }
    }
}

//AGREGAR INFO SOBRE EL LINK PROPORCIONADO
function getFileInfo(divFileInfoId, inputId) {
    const div = document.getElementById(divFileInfoId);
    const input = document.getElementById(inputId);
    const csrftoken = getCookie('csrftoken');
    url = '/downloader/'
    
    const urlFile = input.value;
    div.classList.remove('file-info-show')
    div.classList.add('file-info')
    
    numDivId = divFileInfoId.split("_")[1];
    errorDivId = `errorMessage_${numDivId}`
    console.log(errorDivId)
    changeErrorStatus(errorDivId)

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
        div.classList.remove('file-info')
        div.classList.add('file-info-show')
    })
}

//ENVIO DE FORMULARIOS AL BACKEND
async function sendForms () {
    submitAllBtn = document.getElementById('submitAllBtn')
    addFormBtn = document.getElementById('addFormBtn')

    const forms = document.querySelectorAll('form');
    const requestUrl = '/downloader/';
    const csrftoken = getCookie('csrftoken');

    
    
    const formPromises = [];
    
    forms.forEach(form => {
        const formData = new FormData(form);
        
        //Ocultar mensaje de error
        let errorDivId = form.querySelector(".alert").id;
        changeErrorStatus(errorDivId);

        //Deshabilitar botones de descarga y añadir campo
        disableButtons()

        //Ocultar botón de borrado y mostrar círculo de carga
        hideTrashShowSpinner(form)

        //CREAR JSON PARA EL BACKEND
        data = {
            'url': formData.get('url'),
            'file_type': formData.get('file_type')
        };

        const formPromise = new Promise((resolve, reject) => {
            fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken 
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                responseHeaders = response.headers;
                if (!response.ok) {
                    // Si la respuesta no es exitosa, rechazar la promesa con el mensaje de error
                    return response.json()
                }
                // Si la respuesta es exitosa, resolver la promesa
                return response.blob()
            })
            .then(data => {

                if (data.error_message){ //Manejo el error, aquí data es un JSON
                    changeErrorStatus(errorDivId, data)
                    console.log("antes")
                    showTrashHideSpinner(form)
                    resolve()
                }
                else{ //Manejo la descarga del archivo, aquí data es un Blob

                    //Descargar archivo en el navegador
                    downloadFile(data)

                    //Eliminar archivo del servidor
                    const deleteFile = responseHeaders.get('delete_file')
                    removeFileFromServer(deleteFile);

                    //Eliminar DIV con el formulario
                    deleteDivForm(form);
                }
            })
            .catch(error => {
                console.error(error)
                console.log("Ha ocurrido un error inesperado")
            })
            .finally(() => {
                //changeTrashButtonAndLoadSpinner(form)
                resolve()
            });
        })
        formPromises.push(formPromise);
    });

    //CUANDO SE REALICEN TODAS LAS DESCARGAS, HABILITAR BOTONES
    Promise.all(formPromises)
    .then(() => { 
        enableButtons()
        showFirstTrashButton()
    })
};

document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('allForms');
    let addFormBtn = document.getElementById('addFormBtn');
    let formCount = 0;

    //AÑADIR FORMULARIOS
    addFormBtn.addEventListener('click', function() {
        if (!addFormBtn.disabled) {
            formCount++;
            const divId = `divFileInfo_${formCount}`;
            const inputId = `urlFile_${formCount}`
            const audioId = `audioRadi_${formCount}`
            const videoId = `videoRadi_${formCount}`
            const errorDivId = `errorMessage_${formCount}`

            const formHtml = `
            <div class="form-group" id="${formCount}">
            <form id="form" class="dynamic-form">
                <div class="file-info" id="${divId}"></div>
                <div class="alert alert-danger" role="alert" id="${errorDivId}"></div>
                <div class="d-flex align-items-center">
                    <i class="link-icon bi bi-link-45deg"></i>
                    <input type="text" name="url" class="form-control" id="${inputId}" oninput="getFileInfo('${divId}', '${inputId}')" required>
                    <div class="list-file-type" name="file_type">
                    <label class="file-type d-inline-flex align-items-center">
                    <input class="form-check-input" type="radio" name="file_type" value="audio" id="${audioId}" onchange="changeFileIcon('${audioId}')" checked>
                    <i class="bi bi-file-music-fill"></i>
                </label>
                <label class="file-type d-inline-flex align-items-center">
                    <input class="form-check-input" type="radio" name="file_type" value="video" id="${videoId}" onchange="changeFileIcon('${videoId}')">
                    <i class="bi bi-camera-reels"></i>
                </label>
                    </div>
                    <button type="button" class="trash-button btn" onclick="deleteForm('${formCount}')"><i class="bi bi-trash3"></i></button>
                    <div class="spinner-border text-danger" role="status"></div>
                    </div>
            </form>
            </div>
                    `;
                    formContainer.insertAdjacentHTML('beforeend', formHtml);
        }
    });
})