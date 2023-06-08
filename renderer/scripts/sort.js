
const form = document.querySelector('#sort-form');


form.addEventListener('submit', (event) => {
    event.preventDefault(); // prevent the default form submission

    // get form data 
    const formData = new FormData(event.target);
    const sortType = formData.get('sort-type');
    const sortOrder = formData.get('sort-order');
    const sortMethod = formData.get('sort-method');

    // send data to the main process via IPCRenderer
    pages.sort({
        type: sortType,
        order: sortOrder,
        method: sortMethod
    });
});

function previewFormData(event)
{
    event.preventDefault();
    var form = document.getElementById('sort-form');
    var formData = new FormData(form);

    pages.preview(formData.get('sort-type'), formData.get('sort-order'));
}

const sortTypeSelect = document.getElementById('sort-type');
const sortOrderSelect = document.getElementById('sort-order');
