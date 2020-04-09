import User from "@/models/UserModel";
import State from "@/state";

function submitRequest(method: string, endpoint: string, body: object | null, onSuccess: (data: any) => void, onFailure: (message: string) => void) {
    let headers: any = { "Content-Type": "application/json" };
    if (State.state.token != "") {
        headers["Authorization"] = "Bearer " + State.state.token;
    }
    fetch(new Request(process.env.VUE_APP_API_HOST + endpoint, { method: method, body: body == null ? null : JSON.stringify(body), headers })).then(response => {
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
    static authenticateUser(username: string, password: string, onSuccess: (token: string, id: string) => void, onFailure: (message: string) => void) {
        submitRequest("POST", "/api/users/authenticate", { username: username, password: password }, (data: any) => {
            onSuccess(data.token, data.id);
        }, onFailure);
    }

    static listUsers(onSuccess: (users: User[]) => void, onFailure: (message: string) => void) {
        submitRequest("GET", "/api/users/list", null, (data: any) => {
            onSuccess(data);
        }, onFailure);
    }

    static getUser(id: string, onSuccess: (user: User) => void, onFailure: (message: string) => void) {
        submitRequest("GET", "/api/users/user/" + id, null, onSuccess, onFailure);
    }

    static createUser(username: string, password: string, displayName: string, email: string, roles: string[], onSuccess: () => void, onFailure: (message: string) => void) {
        submitRequest("POST", "/api/users/create", { username, password, displayName, email, roles }, (data: any) => {
            onSuccess();
        }, onFailure);
    }

    static deleteUser(id: string, onSuccess: () => void, onFailure: (message: string) => void) {
        submitRequest("POST", "/api/users/delete", { id }, (data: any) => {
            onSuccess();
        }, onFailure);
    }
};