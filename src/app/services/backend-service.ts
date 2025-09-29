import { Injectable } from '@angular/core';
import { DefaultService } from '../../generated/api/api/default.service';
import { HttpClient } from '@angular/common/http';
import { BASE_PATH, Configuration } from '../../generated/api';

@Injectable({
  providedIn: 'root'
})
export class BackendService extends DefaultService {
//   constructor(http: HttpClient, config: Configuration) {
//     super(http, BASE_PATH, config);
//   }
}