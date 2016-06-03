var btnFilter, myDropdown, btnCloseModal;

$(document).ready(function () {
    btnFilter = $('#btnFilter');
    myDropDown = $('#myDropDown');
    btnFilter.bind('click', openDropDown);
});

function openDropDown() {
    myDropDown.show();
}

function closeDropDown() {
    myDropDown.hide();
}

window.onclick = function (event) {
    if (!event.target.matches('#btnFilter')) {
        closeDropDown();
    }
}