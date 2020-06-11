import { Injectable } from '@angular/core';
import _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class DashboardChartService {

  constructor() { }
  getTodayColumnChartData(data) {
    const todayData = data.today[0].data;
    const result = Object.keys(todayData).map((key) => {
      return todayData[key];
    });
    result.unshift('Today');
    const dataTable = [];
    dataTable.push(['', 'MIS', 'Pipeline', 'Closure']);
    dataTable.push(result);
    console.log('result', result);
    return dataTable;
  }

  getTodayPieChartData(data) {
    const todayData = data.today[0].data;
    const dataTable = [];
    dataTable.push(['Lead', '']);
    _.map(todayData, (x, y) => {
      dataTable.push([y.charAt(0).toUpperCase() + y.slice(1), x]);
    });
    return dataTable;
  }

  getWeeklyColumnChartData(data) {
    const week = data.week;
    const dataTable = [];
    dataTable.push(['', 'MIS', 'Pipeline', 'Closure']);
    _.map(week, (day) => {
      const arr = [];
      arr.push(day.name);
      _.map(day.data , x => {
        arr.push(x);
      });
      dataTable.push(arr);
    });
    console.log('weeklyData', dataTable);
    return dataTable;
  }

  getWeeklyPieChartData(data) {
    const week = data.week;
    const dataTable = [];
    dataTable.push(['Lead', '']);
    dataTable.push(['MIS', 0]);
    dataTable.push(['Pipeline', 0]);
    dataTable.push(['Closure', 0]);
    _.map(week, (day) => {
      _.map(day.data , (x, y) => {
        if (y === 'mis') {
          dataTable[1][1] += x;
        } else if (y === 'pipeline') {
          dataTable[2][1] += x;
        } else if (y === 'closure') {
          dataTable[3][1] += x;
        }
      });
    });
    return dataTable;
  }
  getMonthlyColumnChartData(data) {
    const month = data.month;
    console.log('month', month);
    const dataTable = [];
    dataTable.push(['', 'MIS', 'Pipeline', 'Closure']);
    _.map(month, (day) => {
      const arr = [];
      arr.push(day.name);
      _.map(day.data , x => {
        arr.push(x);
      });
      dataTable.push(arr);
    });
    console.log('monthlyData', dataTable);
    return dataTable;
  }

  getMonthlyPieChartData(data) {
    const month = data.month;
    const dataTable = [];
    dataTable.push(['Lead', '']);
    dataTable.push(['MIS', 0]);
    dataTable.push(['Pipeline', 0]);
    dataTable.push(['Closure', 0]);
    _.map(month, (day) => {
      _.map(day.data , (x, y) => {
        if (y === 'mis') {
          dataTable[1][1] += x;
        } else if (y === 'pipeline') {
          dataTable[2][1] += x;
        } else if (y === 'closure') {
          dataTable[3][1] += x;
        }
      });
    });
    return dataTable;
  }

  }
