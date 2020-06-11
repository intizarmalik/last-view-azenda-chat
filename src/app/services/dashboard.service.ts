import { LeadService } from './lead.service';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import _ from 'underscore';
import { literal } from '@angular/compiler/src/output/output_ast';

class LeadData {
  mis: number;
  pipeline: number;
  closure: number;
}

class LeadContainer {
  today: Array<{
    name: string,
    data: LeadData
  }>;
  week: Array<{
    name: string,
    data: LeadData
  }>;
  month: Array<{
    name: string,
    data: LeadData
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  startOfWeek = moment().startOf('isoWeek');
  endOfWeek = moment().endOf('isoWeek');
  startOfMonth = moment().startOf('month');
  endOfMonth = moment().endOf('month');

  constructor(private leadService: LeadService) {
  }

  async getLeadList() {
    return await this.leadService.leadList();
  }

  /**
   * Get all the lead data for chart
   */
  async getLeads(userId) {
    const leads = await this.leadService.leadList() as any;
    var leadList = [];
    if (userId != "") {
      leads.map(l => {
        if (l.createdBy.id == userId)
          leadList.push(l);
      });
    } 
    else leadList = leads;
   
    const data = new LeadContainer();
    // for today
    data.today = [{ name: 'Today', data: this.arrangeLeadByDate(leadList, moment(), 'date', 'day') }];
    // for week
    data.week = [];
    const startOfWeek = moment().startOf('isoWeek');
    for (let i = 0; i < 7; i++) {

      data.week.push({
        name: startOfWeek.format('ddd').toString(),
        data: this.arrangeLeadByDate(leadList, startOfWeek, 'day', 'days')
      });
      startOfWeek.add(1, 'days');
    }
    // for month
    data.month = [];
    const startOfMonth = moment().month(0);
    for (let i = 0; i < 12; i++) {
      data.month.push({
        name: moment(startOfMonth).format('MMM').toString(),
        data: this.arrangeLeadByDate(leadList, startOfMonth, 'month', 'months')
      });
      startOfMonth.add(1, 'months');
    }
    return data;
  }

  /**
   * Get all leads of specific date
   */
  arrangeLeadByDate(data: Array<any>, date: moment.Moment, unitOfTime, unit): LeadData {
    const response = {
      mis: 0,
      pipeline: 0,
      closure: 0
    };
    data.forEach(lead => {
      // check if closure
      if (lead.closureDate) {
        if (moment(lead.closureDate).isBetween(moment(date).subtract(1, unit).endOf(unitOfTime), moment(date).endOf(unitOfTime))) {
          response.closure++;
        }
        return;
      }
      // check if pipeline
      if (lead.pipelineDate) {
        if (moment(lead.pipelineDate).isBetween(moment(date).subtract(1, unit).endOf(unitOfTime), moment(date).endOf(unitOfTime))) {
          response.pipeline++;
        }
        return;
      }
      if (moment(lead.date).isBetween(moment(date).subtract(1, unit).endOf(unitOfTime), moment(date).endOf(unitOfTime))) {
        response.mis++;
      }
    });

    return response;
  }

  async filterLeadsBy(leadList: any) {
    const data = [0, 0, 0];
    const date = moment();
    _.map(leadList, (lead) => {
      if (lead.closureDate) {
        if (moment(lead.closureDate).isBetween(moment(date).subtract(1, 'days').endOf('day'), moment(date).endOf('day'))) {
          data[2]++;
        }
        return;
      }
      // check if pipeline
      if (lead.pipelineDate) {
        if (moment(lead.pipelineDate).isBetween(moment(date).subtract(1, 'days').endOf('day'), moment(date).endOf('day'))) {
          data[1]++;
        }
        return;
      }
      if (moment(lead.date).isBetween(moment(date).subtract(1, 'days').endOf('day'), moment(date).endOf('day'))) {
        data[0]++;
      }
    });
    return data;
  }

  async filterLeadsByWeek(pieChartData) {
    const data = [0, 0, 0];
    _.map(pieChartData, (lead) => {
      if (lead.closureDate) {
        if (moment(lead.closureDate).isBetween(this.startOfWeek, this.endOfWeek)) {
          data[2]++;
        }
        return;
      }
      // check if pipeline
      if (lead.pipelineDate) {
        if (moment(lead.pipelineDate).isBetween(this.startOfWeek, this.endOfWeek)) {
          data[1]++;
        }
        return;
      }
      if (moment(lead.date).isBetween(this.startOfWeek, this.endOfWeek)) {
        data[0]++;
      }
    });
    return data;
  }

  async filterLeadsByMonth(pieChartData) {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const data = [0, 0, 0];
    _.map(pieChartData, (lead) => {
      if (lead.closureDate) {
        if (moment(lead.closureDate).isBetween(this.startOfMonth, this.endOfMonth)) {
          data[2]++;
        }
        return;
      }
      // check if pipeline
      if (lead.pipelineDate) {
        if (moment(lead.pipelineDate).isBetween(this.startOfMonth, this.endOfMonth)) {
          data[1]++;
        }
        return;
      }
      if (moment(lead.date).isBetween(this.startOfMonth, this.endOfMonth)) {
        data[0]++;
      }
    });
    return data;
  }

  async filterLeadsByDateRange(dateRange) {
    const startDate = moment(dateRange[0]).endOf('day');
    const endDate = moment(dateRange[1]).endOf('day');
    // console.log('startDate, endDate', startDate, endDate);
    const leadList = await this.leadService.leadList() as any;
    const data = [];
    for (let i= startDate; i<= endDate;){
      data.push({
        name: moment(startDate).format('MMM-DD').toString(),
        data: this.arrangeLeadByDate(leadList, startDate, 'day', 'days')
      });
      i = startDate.add(1, 'days');
    }
    const dataTable = {
      columnDataTable: [],
      pieChartDataTable: []
    };
    dataTable.columnDataTable.push(['', 'MIS', 'Pipeline', 'closuer']);
    _.map(data, day=> {
      const arr =[];
      arr.push(day.name);
      _.map(day.data, x => {
        arr.push(x);
      });
      dataTable.columnDataTable.push(arr);
    });
    dataTable.pieChartDataTable.push(['Lead', '']);
    dataTable.pieChartDataTable.push(['MIS', 0]);
    dataTable.pieChartDataTable.push(['Pipeline', 0]);
    dataTable.pieChartDataTable.push(['closure', 0]);
    _.map(data, (day) => {
      _.map(day.data, (x,y) => {
        if(y === 'mis'){
          dataTable.pieChartDataTable[1][1] += x;
        }else if (y === 'pipeline'){
          dataTable.pieChartDataTable[2][1] += x;
        }else if (y === 'closure'){
          dataTable.pieChartDataTable[3][1] += x;
        }
      });
    });
    return dataTable;
  }
}
