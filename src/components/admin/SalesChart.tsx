'use client'
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// ลงทะเบียน Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function SalesChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('th-TH', { 
                style: 'currency', 
                currency: 'THB' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB',
              maximumSignificantDigits: 3
            }).format(value);
          }
        }
      }
    }
  }

  const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

  const data = {
    labels,
    datasets: [
      {
        label: 'ยอดขาย',
        data: [1000000, 1200000, 800000, 1500000, 900000, 1100000, 1300000, 950000, 1400000, 1000000, 1200000, 1600000],
        backgroundColor: 'rgba(0, 180, 219, 0.8)',
      },
      {
        label: 'กำไร',
        data: [400000, 500000, 300000, 600000, 350000, 450000, 550000, 400000, 580000, 420000, 480000, 650000],
        backgroundColor: 'rgba(46, 213, 115, 0.8)',
      },
    ],
  }

  return <Bar options={options} data={data} />
} 