import { Injectable }     from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {ListModel} from '../models/list.model';
import {Angular2TokenService} from 'angular2-token';

@Injectable()

export class ListService {

  static lists: Array<ListModel>;

  static getCachedList (id: number) {
    if (!ListService.lists) {
      return null;
    }
    for (let i = ListService.lists.length - 1; i >= 0; i--) {
      if (ListService.lists[i].id === id) {
        return ListService.lists[i];
      }
    }
    return null;
  }

  constructor (private http: Angular2TokenService) {}

  getLists () {
    return this.http.get('boards').map(
      (res) => {
        ListService.lists = [];
        let lists = res.json();
        for (let i = lists.length - 1; i >= 0; i--) {
          ListService.lists[i] = new ListModel(lists[i]);
        }
        return ListService.lists;
      }
    );
  }

  getList (id: number) {
    return this.http.get(`boards/${id}`).map(
      (res) => {
        let list = new ListModel(res.json());
        for (let i = ListService.lists.length - 1; i >= 0; i--) {
          if (ListService.lists[i].id === list.id) {
            ListService.lists[i] = list;
            break;
          }
        }
        return list;
      }
    )
    .catch(this.handleError);
  }

  getCachedList (id: number) {
    return ListService.getCachedList(id);
  }

  createList (list: ListModel) {
    return this.http.post('boards', list.serialize()).map(
      (res) => {
        let newList = new ListModel(res.json());
        ListService.lists.push(newList);
        console.log(ListService.lists)
        return newList;
      }
    );
  }

  updateList (list: ListModel) {
    return this.http.put(`boards/${list.id}`, list.serialize()).map(
      (res) => {
        for (let i = ListService.lists.length - 1; i >= 0; i--) {
          if (ListService.lists[i].id === list.id) {
            ListService.lists[i] = list;
            break;
          }
        }
        return list;
      }
    )
    .catch(this.removeFromListsErrorCB(this, list));
  }

  deleteList (list: ListModel) {
    return this.http.delete(`boards/${list.id}`).map(this._removeFromLists(list));
  }

  private _removeFromLists (list) {
    return (res) => {
      for (let i = ListService.lists.length - 1; i >= 0; i--) {
        if (ListService.lists[i].id === list.id) {
          ListService.lists.splice(i, 1);
          break;
        }
      }
    };
  }

  private removeFromListsErrorCB (self: ListService, list: ListModel) {
    return (err) => {
      self._removeFromLists(list)(err);
      return Observable.throw(err);
    };
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errMsg);
  }
}