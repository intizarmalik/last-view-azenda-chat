import { ToastrService } from 'ngx-toastr';
import { ApiCallService } from './api-call.service';
import { Injectable } from '@angular/core';
import Config from '../../assets/js/config.js';
import { UtilsService } from '../utils/utils.service';

class Data {
  branch: any;
  leadSource: any;
  leadType: any;
  leadRequirement: any;
  salesModel: any;
  branchUser: any;
  // role: any;
  // stl: any;
  // sm: any;
  // stTc: any;
  // dtl: any;
  // dta: any;
  // da: any;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {

  constructor(
    private toastr: ToastrService,
    private utilsService: UtilsService,
    private apiCallService: ApiCallService
  ) {
  }
  getSalesModelsList: any;
  findIndex(arg0: (lead: any) => boolean) {
    throw new Error('Method not implemented.');
  }
  async getDataFor(array: Array<string>) {
    return Promise.all(array.map(api => {
      const request = {
        method: 'get',
        apiEndPoint: 'api/v1/' + api,
        Authorization: true
      };
      return this.apiCallService.hitApi(request);
    }));
  }
  async getNeededData() {
    const data = new Data();
    [data.branch,
    data.leadSource,
    data.leadType,
    data.leadRequirement,
    data.salesModel,
    ] = await this.getDataFor([
      'branch',
      'lead-source',
      'lead-type',
      'lead-requirement',
      'sales-model',
    ]);
    const preparedUser = {
      branch: [],
      leadSource: [],
      leadType: [],
      leadRequirement: [],
      salesModel: [],
      // branchUser: [],
      badmin: [],
      stl: [],
      sm: [],
      stTc: [],
      dtl: [],
      da: [],
      all: []
    };
    preparedUser.branch = data.branch.data.data || [];
    preparedUser.leadSource = data.leadSource.data.data || [];
    preparedUser.leadType = data.leadType.data.data || [];
    preparedUser.leadRequirement = data.leadRequirement.data.data || [];
    preparedUser.salesModel = data.salesModel.data.data || [];
    preparedUser.all = preparedUser.all
      .concat(preparedUser.badmin)
      .concat(preparedUser.stl)
      .concat(preparedUser.sm)
      .concat(preparedUser.stTc)
      .concat(preparedUser.dtl)
      .concat(preparedUser.da);
    return preparedUser;
  }
  async getBranchData(id = '') {
    const data = new Data();
    const request = {
      method: 'get',
      apiEndPoint: 'api/v1/branch-user/' + id,
      Authorization: true
    };
    data.branchUser = await this.apiCallService.hitApi(request);
    const preparedUser = {
      all: [],
      badmin: [],
      stl: [],
      sm: [],
      stTc: [],
      dtl: [],
      da: [],
    };
    preparedUser.badmin = data.branchUser.data.data.badmin || [];
    preparedUser.stl = data.branchUser.data.data.stl || [];
    preparedUser.sm = data.branchUser.data.data.sm || [];
    preparedUser.stTc = data.branchUser.data.data.tc || [];
    preparedUser.dtl = data.branchUser.data.data.dtl || [];
    preparedUser.da = data.branchUser.data.data.da || [];
    preparedUser.all = preparedUser.all
      .concat(preparedUser.badmin)
      .concat(preparedUser.stl)
      .concat(preparedUser.sm)
      .concat(preparedUser.stTc)
      .concat(preparedUser.dtl)
      .concat(preparedUser.da);
    return preparedUser;
  }
  async getAllData(id = '') {
    const data = new Data();
    const request = {
      method: 'get',
      apiEndPoint: 'api/v1/all-user',
      Authorization: true
    };
    data.branchUser = await this.apiCallService.hitApi(request);
    const preparedUser = {
      all: [],
      badmin: [],
      stl: [],
      sm: [],
      stTc: [],
      dtl: [],
      da: [],
    };
    preparedUser.badmin = data.branchUser.data.data.badmin || [];
    preparedUser.stl = data.branchUser.data.data.stl || [];
    preparedUser.sm = data.branchUser.data.data.sm || [];
    preparedUser.stTc = data.branchUser.data.data.tc || [];
    preparedUser.dtl = data.branchUser.data.data.dtl || [];
    preparedUser.da = data.branchUser.data.data.da || [];
    preparedUser.all = preparedUser.all
      .concat(preparedUser.badmin)
      .concat(preparedUser.stl)
      .concat(preparedUser.sm)
      .concat(preparedUser.stTc)
      .concat(preparedUser.dtl)
      .concat(preparedUser.da);
    return preparedUser;
  }

  async create(data) {
    return this.hitRequest('post', null, data);
  }
  async pipeline(id, data) {
    return this.hitRequest('post', id, data, 'pipeline');
  }
  async closure(id, data) {
    return this.hitRequest('post', id, data, 'closure');
  }
  async MIS(id, data) {
    return this.hitRequest('post', id, data, 'lead');
  }
  async viewlead(id, data) {
    return this.hitRequest('post', id, data, 'lead');
  }
  async status(id, data) {
    return this.hitRequest('post', id, data, 'lead');
  }
  async detail(id) {
    const request = {
      apiEndPoint: id ? Config.url.lead + '/' + id : Config.url.lead,
      method: 'get',
      Authorization: true,
      data: {}
    };
    const response = await this.apiCallService.hitApi(request);
    if (response.status === 200) {
      return response.data.data;
    } else {
      this.toastValidationErrors(response.data.errors);
      this.toastr.error(response.data.message);
      return false;
    }
    return this.hitRequest('get', id, {});
  }
  toastValidationErrors(errors) {
    // const bucket = [];
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        errors[key].forEach(error => {
          this.toastr.error(error);
        });
      }
    }
  }
  private async hitRequest(method, id = null, data = {}, url = 'lead') {
    const request = {
      apiEndPoint: id ? Config.url[url] + '/' + id : Config.url[url],
      method,
      Authorization: true,
      data
    };
    const response = await this.apiCallService.hitApi(request);
    if (response.status === 200) {
      this.toastr.success(response.data.message);
      return response;
    } else {
      this.toastValidationErrors(response.data.errors);
      this.toastr.error(response.data.message);
      return false;
    }
  }
  async export() {
    const request = {
      method: 'get',
      apiEndPoint: Config.url.leadExport,
      Authorization: true
    };
    const response = await this.apiCallService.hitApi(request);
    if (response.status === 200) {
      this.toastr.success('File ready for download');
    } else {
      this.toastr.error('Could not create download link!');
    }
    return response;
  }
  async leadList() {
    const request = {
      apiEndPoint: Config.url.lead,
      method: 'get',
      Authorization: true
    };
    return this.utilsService.checkApiResponse(await this.apiCallService.hitApi(request));
  }
  async importLeads(data) {
    const request = {
      apiEndPoint: Config.url.importLeads,
      method: 'post',
      Authorization: true,
      data
    };
    return this.utilsService.checkApiResponse(await this.apiCallService.hitApi(request));
  }
  async deleteLead(leadId) {
    const request = {
      apiEndPoint: Config.url.lead + '/' + leadId,
      method: 'delete',
      Authorization: true
    };
    const response = await this.apiCallService.hitApi(request);
    if (response.data.message) {
      this.toastr.success(response.data.message, '');
    }
    return response;
  }
}
