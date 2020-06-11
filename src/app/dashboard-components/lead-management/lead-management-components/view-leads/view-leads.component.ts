import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import _ from 'underscore';
import * as moment from 'moment';
import { LeadService } from '../../../../services/lead.service';
import { BranchService } from '../../../../services/branch.service';
import { LeadSourceService } from '../../../../services/lead-source.service';
import { SalesModelService } from '../../../../services/sales-model.service';
import { UtilsService } from '../../../../utils/utils.service';
import { UserService } from '../../../crm-master/crm-master-components/user.service';
import { LeadTypeService } from '../../../../services/lead-type.service';
import { delay } from 'rxjs/operators';
import { AddLeadComponent } from '../add-lead/add-lead.component';


@Component({
  selector: 'app-view-leads',
  templateUrl: './view-leads.component.html',
  styleUrls: ['./view-leads.component.scss'],
  providers: [AddLeadComponent]
})
export class ViewLeadsComponent implements OnInit {
  viewLeadData: any;
  viewLead: any;
  leads = [];
  dateRange = [];
  activeViewLead: any;
  importLeadButtonText = 'Import Leads';
  constructor(
    private utils: UtilsService,
    private toastr: ToastrService,
    private leadService: LeadService,
    private branchService: BranchService,
    private leadSourceService: LeadSourceService,
    private salesModelService: SalesModelService,
    private userService: UserService,
    private leadTypeService: LeadTypeService,
    private leadComponent: AddLeadComponent,
  ) {
  }

  async ngOnInit() {
    await this.getLeadList();
    this.reinitialiseDataTable();
  }
  async getLeadList() {
    this.leads = await this.leadService.leadList();
    
    this.mapLeadTableData();
    console.log('example', this.mapLeadTableData())
  }
  async mapLeadTableData() {
    // get branch name
    const branchList = await this.branchService.getBranchesList();
    this.leads = await this.utils.getBranchName(this.leads, branchList);
    // get lead source name
    const leadSourceList = await this.leadSourceService.getLeadSourceList();
    this.leads = this.utils.getLeadSourceName(this.leads, leadSourceList);
    // get sales model name
    const salesModelList = await this.salesModelService.getSalesModelsList();
    this.leads = this.utils.getSalesModelName(this.leads, salesModelList);
    const userList = await this.userService.list();
    this.leads = this.utils.getUserName(this.leads, userList);
    const leadTypeList = await this.leadTypeService.getLeadTypeList();
    this.leads = this.utils.getLeadTypeName(this.leads, leadTypeList);
    //  this.reinitialiseDataTable();
  }

  getStringified(lead) {
    return JSON.stringify(lead);
  }
  reinitialiseDataTable() {
    // @ts-ignore
    window.destroyDataTable('dataTable');
    setTimeout(() => {
      // @ts-ignore
      window.InitialiseDataTable('dataTable', {
        dom: 'Bfrtip',
        buttons: [
          'csv', 'excel'
        ]
      });
    }, 300);
  }
  getFormattedDate(date) {
    const formattedDate = moment(date).format('ll');
    return formattedDate !== 'Invalid date' ? formattedDate : '-';
  }
  filterLeadByDate() {
    if (this.dateRange.length < 1) {
      this.toastr.warning('Please specify date range');
    } else {
      this.leads = _.filter(this.leads, (lead) => {
        const startDate = moment(this.dateRange[0]).subtract(1, 'days');
        const endDate = moment(this.dateRange[1]).add(1, 'days');
        return moment(lead.date).isBetween(startDate, endDate);
      });
      this.reinitialiseDataTable();
    }
  }
  async resetLeadList() {
    this.dateRange = [];
    await this.getLeadList();
  }
  async deleteLead(id) {
    await this.leadService.deleteLead(this.activeViewLead.id);
    const index = this.leads.findIndex((lead) => {
      return lead.id === this.activeViewLead.id;
    });
    this.leads.splice(index, 1);
    // @ts-ignore
    window.hideBootStrapModal(id);
  }
  editLeadData(viewLeadData: any) {
  }
  checkLeadStatus(lead) {
    if (lead.closureDate) {
      return 'Closure';
    } else if (lead.pipelineDate) {
      return 'Pipeline';
    } else {
      return 'MIS';
    }
  }
  updateLeadStatus(lead: any) {
  }
  async importLeads(uploadLeadCSV: HTMLInputElement) {
    this.importLeadButtonText = 'Importing Leads ... <i class="fa fa-spinner fa-spin"></i>';
    const fileList = uploadLeadCSV.files;
    if (fileList[0].name) {
      const arr = fileList[0].name.split('.');
      console.log('sdgasgasdasd', arr.includes('csv'));
    } else {
      this.toastr.error('File type is not Supported');
    }
    console.log('importLeads', fileList);
    const response = await this.leadService.importLeads(this.createFormData(fileList[0]));
    this.importLeadButtonText = 'Import Leads';
  }

  getMeeterList(meetings) {
    return meetings.map(meeting => {
      // return meeting.personId.map(person => person.name).join(', ');
       return meeting.personId.map(person => person).join(', ');
    });
  }

  getMeeterRemarks(meetings) {
    return meetings.map(meeting => {
      return meeting.remarks;
    });
  }

  getBudgetType(value = 'oth') {
    const dataSet = {
      fv: ' Furnishing Value',
      bv: 'Buying Value',
      sv: 'Sale Value',
      lv: 'Lease Value',
      lsonb: 'LSO NB Value',
      pcwow: 'Project Consultation WOW',
      brkrg: 'Brokerage',
      oth: 'Other'
    };
    return dataSet[value] ? dataSet[value] : 'Other';
  }

  getBrokerageType(value = 'oth') {
    const dataSet = {
      'brokerage-in': 'Brokerage - Incoming',
      'brokerage-out': 'Brokerage - Outgoing',
      '-1': 'Brokerage - Zero',
    };
    return dataSet[value] ? dataSet[value] : 'Other';
  }

  createFormData(file) {
    const formData = new FormData();
    formData.set('file', file);
    return formData;
  }
  async changeViewLeadStatus(id) {
    console.log(this.activeViewLead, 'sonalika');
    this.activeViewLead.isActive = !this.activeViewLead.isActive;
    await this.leadService.status(this.activeViewLead.id, this.activeViewLead);
    // @ts-ignore
    window.hideBootStrapModal(id);
  }
}
