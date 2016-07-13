$('#updateButton').click(updateTool);
function updateTool () {
    $('#updateButton')
        .addClass('disabled')
        .off('click', updateTool)
        .text('updating...');

    dfxAjax.get('/console/updateversion', null, true)
    .then(
        function(answer){

            $('#updateButton').text('restarting...');
            setTimeout(restartIfServerAlive, 2000);
        },
        showUpdateError
    );
}

function showUpdateError ( error ) {

    $('#updateButton').text('error occurred');

    alert(
        'error occurred,\nduring the version update:\n\n' +
        error + '\n\n see server logs for more info.'
    );

    $('#updateButton').hide();
}

var attemptsToReload = 0;

function restartIfServerAlive () {
    
    $.ajax('/console') // just to test server is running
    .then(
        function(){
            window.location.reload();
        },
        function(){
            if ( ++attemptsToReload < 10 ) setTimeout(restartIfServerAlive, 1000);
            else {
                $('#updateButton').text('error occured');
                alert(
                    'error occured during server reloading.' +
                    '\nserver is down. see server logs.'
                );
                $('#updateButton').hide();
            }
        }
    );
}
