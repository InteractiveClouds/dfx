function addModal(){
    if (!$('#dataConfirmModal').length) {
        $('body').append('<div id="dataConfirmModal" class="modal fade" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true">'
            +'<div class="modal-dialog">'
            +'<div class="modal-content">'
            +'<div class="modal-header">'
            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
            +'<h3 id="dataConfirmLabel">Please Confirm</h3></div>'
            +'<div class="modal-body"></div>'
            +'<div class="modal-footer">'
            +'<button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>'
            +'<a class="btn btn-primary" id="dataConfirmOK">OK</a></div></div></div></div>');
    }
}

function generateToken(e){
    e.preventDefault();
    var elem = $('#tenantGenerateToken'),
        token = elem.parents('.input-group').find('#tenantToken').val(),
        tenant_name = $('#tenantId').val(),
        data = {'token':token};
    addModal();
    $('#dataConfirmModal').find('.modal-body').html('<h4>'+elem.attr('data-confirm')+'</h4>');
    $('#dataConfirmOK').unbind('click');
    $('#dataConfirmOK').click(function(ev) {
        $.post('/console/'+tenant_name+'/generateToken/',data)
            .then(function(resp){
                var o = JSON.parse(resp);
                $('#tenantToken').val(o.token);
                $('#dataConfirmModal').modal('hide');
            });
        return false;
    });
    $('#dataConfirmModal').modal('show');
    return false;
}

function removeToken(e){
    var elem = $(e.target),
        parentDiv = elem.parents('.input-group'),
        token = parentDiv.find('#tenantToken').val(),
        tenant_name = $('#tenantId').val(),
        data = {'token':token};

    $.post('/console/'+tenant_name+'/removeToken/',data)
        .then(function(resp){
            parentDiv.remove();
        });
}

$(document).ready(function() {
    $('a[data-confirm]').click(function(e) {
        var href = $(this).attr('href');
        addModal();
        $('#dataConfirmModal').find('.modal-body').html('<h4>'+$(this).attr('data-confirm')+'</h4>');
        $('#dataConfirmOK').attr('href', href);
        $('#dataConfirmModal').modal('show');
        return false;
    });
});
