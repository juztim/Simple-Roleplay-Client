if('alt' in window){
    alt.on('login:cef:setStorage', (username, password) =>{
        $('#Uname').val(username);
        $('#Pword').val(password);
    })
}

function login() {
    if(!empty($('#Uname').val()) && !empty($('#Pword').val())) {
        alt.emit('client:login:login',$('#Uname').val(), $('#Pword').val());
    } else {
        $("#NotAllFieldsModal").modal("show");
    }
}

document.getElementById("Uname").addEventListener("keyup", (event) => {
    if(event.keyCode === 13) {
        event.preventDefault();
        login();
    }
});

document.getElementById("Pword").addEventListener("keyup", (event) => {
    if(event.keyCode === 13) {
        event.preventDefault();
        login();
    }
});

document.getElementById("regUname").addEventListener("keyup", (event) => {
    if(event.keyCode === 13) {
        event.preventDefault();
        register();
    }
});

document.getElementById("regPword").addEventListener("keyup", (event) => {
    if(event.keyCode === 13) {
        event.preventDefault();
        register();
    }
});

document.getElementById("regConfPword").addEventListener("keyup", (event) => {
    if(event.keyCode === 13) {
        event.preventDefault();
        register();
    }
});

function register() {
    if(!empty($("#regUname").val()) && !empty($("#regPword").val()) && !empty($("#regConfPword").val())) {
        if($("#regPword").val() == $("#regConfPword").val()) {
            alt.emit('client:login:register',$('#regUname').val(), $('#regPword').val());
        } else {
            $("#WrongConfirmationModal").modal("show");
        }
    } else {
        $("#NotAllFieldsModal").modal("show");
    }
}

function empty(string) {
    if(string == undefined || string == "") {
        return true;
    } else {
        return false;
    }
}

if('alt' in window) {
    alt.on('view:login:showGeneralModal', general);
}

function general(Title, Message) {
    $("#GeneralModalLabel").html(Title);
    $("#GeneralModalBody").html(Message);
    $("#GeneralModal").modal("show");
}