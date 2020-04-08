
function submitRequest(method: string, endpoint: string, body: object | null, onSuccess: (data: any) => void, onFailure: (message: string) => void) {
    fetch(new Request(process.env.VUE_APP_API_HOST + endpoint, { method: method, body: body == null ? null : JSON.stringify(body), headers: { "Content-Type": "application/json" } })).then(response => {
        return response.json();
    }).then(json => {
        if (json.success) {
            onSuccess(json.data);
        }
        else {
            onFailure(json.message);
        }
    }).catch(error => {
        onFailure(error);
    });
}

export default class UPClient {
    static authenticateUser(username: string, password: string, onSuccess: (token: string) => void, onFailure: (message: string) => void) {
        submitRequest("POST", "/api/users/authenticate", { username: username, password: password }, (data: any) => {
            onSuccess(data.token);
        }, onFailure);
    }
}