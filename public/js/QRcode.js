$(document).ready(function() {

	//alert(window.location.protocol+"//"+window.location.hostname);
	//alert($("input[name=id]").val());
  	var qrcode = new QRCode("qrcode", {
	    text: window.location.protocol+"//"+window.location.hostname+"/account/getPersonalInformation?id="+$("input[name=id]").val(),
	    width: 50,
	    height: 50,
	    colorDark : "#000000",
	    colorLight : "#ffffff",
	    correctLevel : QRCode.CorrectLevel.H
	});	
});