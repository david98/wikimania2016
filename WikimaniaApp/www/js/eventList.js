var bntFilter, modal, btnCloseModal;

$(document).ready(function () {
    bntFilter = $('#bntFilter');
    modal = $('#myModal');
    btnCloseModal = $('#btnCloseModal');
    bntFilter.bind('touchstart', openModal);
    btnCloseModal.bind('touchstart', closeModal());
});

function openModal() {
    modal.show();
}

function closeModal() {
    modal.hide();
}
