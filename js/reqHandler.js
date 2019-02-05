var ReqHandler = function() {
	function ajaxRequest(requestObj, callback) {
		var token = $.session.get('token');
		$.ajax({
			type: requestObj.type,
			url: requestObj.url,
			data: requestObj.data,
			success: function(data) {
				callback(data);			
			},
			error: function(data) {
				callback(data);
			}
		});
	};

	this.post = function(requestObj, callback) {
		requestObj.type = 'POST';
		ajaxRequest(requestObj, callback);
	};

	this.get = function(requestObj, callback) {
		requestObj.type = 'GET';
		ajaxRequest(requestObj, callback);
	};

	this.put = function(requestObj, callback) {
		requestObj.type = 'PUT';
		ajaxRequest(requestObj, callback);
	};

	this.delete = function(requestObj, callback) {
		requestObj.type = 'DELETE';
		ajaxRequest(requestObj, callback);
	};
	return this;
};