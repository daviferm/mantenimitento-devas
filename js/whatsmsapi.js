class RestClient {
    constructor(path) {
        this.path = path;
        this.client = new XMLHttpRequest();
        this.headers = {}
    }
    addHeader(key, value) { this.headers[key] = value }
    execute(method, params = null, success = null, fail = null) {
        this.client.onload = function() { if (this.status == 200) { if (success != null) { success(this.response) } } else { if (fail != null) { success(this) } } };
        this.client.open(method, this.path, true);
        for (var key in this.headers) { this.client.setRequestHeader(key, this.headers[key]) }
        if (params != null) {
            this.client.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            this.client.send(params)
        } else { this.client.send() }
    }
}
class WhatsmsApi {
    constructor(apikey) { this.apikey = apikey }
    sendSms(sms, done) {
        var restclient = new RestClient("https://whatsmsapi.com/api/send_sms");
        restclient.addHeader("x-api-key", this.apikey);
        restclient.execute("POST", "phone=" + sms.phone + "&text=" + sms.text, function(response) {
            var json = {};
            try {
                json = JSON.parse(response);
            } catch (err) {
                json = response;
            }
            if (done == undefined) {
                done(json);
            }
        }, function(response) { console.log(response) })
    }
}