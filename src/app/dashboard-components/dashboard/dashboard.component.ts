import { PushNotificationService } from '../../services/push-notification.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardChartService } from '../../services/dashboard-chart.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  ChartReadyEvent, ChartErrorEvent, ChartSelectEvent,
  ChartMouseOverEvent, ChartMouseOutEvent
} from 'ng2-google-charts';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { LeadService } from '../../services/lead.service';
import { UtilsService } from '../../utils/utils.service';
import { UserService } from '../crm-master/crm-master-components/user.service';
import * as moment from 'moment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users = [];
  activeUser: any;

  constructor(
    private utils: UtilsService,
    private userService: UserService,
    private toastr: ToastrService,
    private leadService: LeadService,
    private dashboardService: DashboardService,
    private dashboardChartService: DashboardChartService,
    private pushService: PushNotificationService) {
    this.pushService.initiate();
  }

  filteredData: any;
  chartTypes = ['today', 'current-week', 'current-month', 'date-Range'];
  activeChartType = this.chartTypes[0];
  activeUserChartType;
  dateRange: any;
  dateRangeDisplayed: any;
  public columnChart: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [
      ['Country', 'Performance', 'Profits'],
      ['Germany', 700, 1200],
      ['USA', 300, 600],
      ['Brazil', 400, 500],
      ['Canada', 500, 1000],
      ['France', 600, 1100],
      ['RU', 800, 1000]
    ],
    options: {
      legend: { position: 'top' },
      chartArea: {
        right: 120,   // set this to adjust the legend width    // set this eventually, to adjust the left margin
      }
    }
  };

  public pieChart: GoogleChartInterface = {
    chartType: 'PieChart',
    dataTable: [
      ['Lead', ''],
      ['MIS', 10],
      ['Pipeline', 20],
      ['Closure', 30]
    ],
    options: {}
  };
  leadList = [];
  leads = [];
  userLeads = [];

  async ngOnInit() {
    this.getActiveUserData();
    this.initializeChart();
    this.leadList = await this.leadService.leadList() as any;

    if(!this.activeUserChartType){
      this.userLeads=this.leadList;
    }
    this.userFilter();

    this.reinitialiseDataTable();

  }

  async initializeChart() {
    this.filteredData = await this.dashboardService.getLeads("") as any;
    console.log('filteredData', this.filteredData);
    this.filterChartsByToday();
  }

  filterChartsByToday() {
    this.filterLeadsAccordingToDays();
    this.columnChart.dataTable = this.dashboardChartService.getTodayColumnChartData(this.filteredData);
    this.pieChart.dataTable = this.dashboardChartService.getTodayPieChartData(this.filteredData);
    console.log('this.columnChart', this.columnChart);
    console.log('this.pieChart', this.pieChart);
    const date = new Date();
    this.dateRangeDisplayed = 'From Date : ' + moment(date).format('DD/MM/YYYY');
    this.refreshCharts('event');
  }
  filterChartsByWeek() {
   
    this.filterLeadsAccordingToDays();
    this.columnChart.dataTable = this.dashboardChartService.getWeeklyColumnChartData(this.filteredData);
    this.pieChart.dataTable = this.dashboardChartService.getWeeklyPieChartData(this.filteredData);
    console.log('this.pieChart', this.pieChart);
    const date = new Date();
    this.dateRangeDisplayed = 'From Date : ' + moment(date).startOf('week').format('DD/MM/YYYY') +
      ' ~ ' + moment(date).format('DD/MM/YYYY');
    this.refreshCharts('event');
  }
  async filterChartsByMonth() {
    
    this.filterLeadsAccordingToDays();
    console.log('leadList', this.leadList);
    this.columnChart.dataTable = this.dashboardChartService.getMonthlyColumnChartData(this.filteredData);
    this.pieChart.dataTable = this.dashboardChartService.getMonthlyPieChartData(this.filteredData);
    console.log('this.pieChart', this.pieChart);
    const date = new Date();
    this.dateRangeDisplayed = 'From Date : ' + moment(date).startOf('month').format('DD/MM/YYYY') +
      ' ~ ' + moment(date).format('DD/MM/YYYY');
    this.refreshCharts('event');
  }

  changeChartTypes() {

    console.log('sdsdsd', this.activeChartType);

    switch (this.activeChartType) {
      case this.chartTypes[0]: {
        this.filterChartsByToday();
      }
        break;
      case this.chartTypes[1]: {
        this.filterChartsByWeek();
      }
        break;
      case this.chartTypes[2]: {
        this.filterChartsByMonth();
      }
        break;

      case this.chartTypes[3]: {
        // this.dateRangeSelected() ;
        // @ts-ignore
        window.jQuery('#dRange').click();
      }
    }

    if (this.activeUserChartType) {
      this.userChart();
    }
  }

  refreshCharts(event) {
    this.columnChart.component.draw();
    this.pieChart.component.draw();
  }

  async dateRangeSelected() {

    this.filterLeadsAccordingToDays();
    const dataByRange = await this.dashboardService.filterLeadsByDateRange(this.dateRange);
    this.columnChart.dataTable = dataByRange.columnDataTable;
    this.pieChart.dataTable = dataByRange.pieChartDataTable;
    console.log('this.pieChart', this.pieChart);
    this.refreshCharts('event');
    this.dateRangeDisplayed = 'From Date : ' + moment(this.dateRange[0]).format('DD/MM/YYYY')
      + ' ~ ' + moment(this.dateRange[1]).format('DD/MM/YYYY');

    if (this.activeUserChartType) {
      this.userChart();
    }
  }
  async userFilter() {
    const userList = await this.userService.list();
    this.users = userList;


    console.log('userList ', userList);

  }

  filterLeadsAccordingToDays() {
    console.log('leadssssssssss',this.userLeads);
    let currentDate = new Date();
    if (this.activeChartType == "today") {
      this.userLeads.map(l => {
        
          l.followupDate.map(d=>{
            console.log("d",d);
            let date =moment(d.date).format('DD/MM/YYYY');
            let today =moment(currentDate).format('DD/MM/YYYY');
            console.log("date",date);
            if (date ==today) {
              this.leads.push(l);
            }
          });
      });
     
      this.reinitialiseDataTable();
    } else if (this.activeChartType == "current-week") {
      this.userLeads.map(l => {
        
          l.followupDate.map(d=>{
            console.log("d",d);

           let start= moment(currentDate).startOf('week').format('DD/MM/YYYY');
            let end =moment(currentDate).format('DD/MM/YYYY');
            let date =moment(d.date).format('DD/MM/YYYY');
            console.log("m",start);
            console.log("em",end);
           
           // const date = new Date(d.date).getDate();
            console.log("date",date);
            if (date>=start && date<=end) {
              this.leads.push(l);
            }
          });
      });
      this.reinitialiseDataTable();
    } else if (this.activeChartType == "current-month") {
      this.userLeads.map(l => {
        l.followupDate.map(d=>{
          console.log("d",d);
          const date = new Date(d.date).getMonth();
          console.log("date",date);
          if (date ==currentDate.getMonth()) {
            this.leads.push(l);
          }
        });
      });
      this.reinitialiseDataTable();
    } else {
      this.userLeads.map(l => {
       // const startDate = moment(this.dateRange[0]).endOf('day').date();
       // const endDate = moment(this.dateRange[1]).endOf('day').date();

        let startDate= moment(this.dateRange[0]).format('DD/MM/YYYY');
            let endDate =moment(this.dateRange[1]).format('DD/MM/YYYY');
            
        //const date = new Date(l.createdAt).getDate();
        console.log("folo::",l.followupDate);
        console.log("startDate",startDate);
        console.log("endDate",endDate);
        l.followupDate.map(d=>{
          console.log("d",d);
          //const date = new Date(d.date).getDate();
          //console.log("date",date);
          let date =moment(d.date).format('DD/MM/YYYY');
          if (date >= startDate && endDate >= date) {
            this.leads.push(l);
          }
        });
        
      });
      this.reinitialiseDataTable();
    }
    //this.reinitialiseDataTable();
  }

  async userChart() {
    this.userLeads = []
    this.leads = [];
    this.leadList.map(l => {
      if (l.createdBy.id == this.activeUserChartType) {
        this.userLeads.push(l);
      }
    });
    this.filterLeadsAccordingToDays();
    this.filteredData = await this.dashboardService.getLeads(this.activeUserChartType) as any;
    if (this.activeChartType == "today")
      this.filterChartsByToday();
    else if (this.activeChartType == "current-week")
      this.filterChartsByWeek();

    else if (this.activeChartType == "current-month")
      this.filterChartsByMonth();
    else {
      this.dateRangeSelected();
    }
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

  getMeeterList(meetings) {
    return meetings.map(meeting => {
      return meeting.personId.map(person => person.name).join(', ');
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
  getFormattedDate(date) {
    const formattedDate = moment(date).format('ll');
    return formattedDate !== 'Invalid date' ? formattedDate : '-';
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
  getActiveUserData() {
    this.activeUser = JSON.parse(localStorage.getItem('userData'));
  }

  reinitialiseDataTable() {
    // @ts-ignore
    window.destroyDataTable('dataTable');
    setTimeout(() => {
      // @ts-ignore
      window.InitialiseDataTable('dataTable', {


      });
    }, 300);
  }
}
