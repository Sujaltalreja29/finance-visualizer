import _ from 'lodash';

// Define the Transaction object type
interface Transaction {
    _id: string;
    amount: number;
    type: string;
    name: string;
    color: string;
    date : Date;
  }

// Define the structure for summed data
interface SummedData {
  type: string;
  color: string;
  total: number;
  percent : number,
}

// Define the structure for chart configuration
interface ChartConfig {
  data: {
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      hoverOffset: number;
      borderRadius: number;
      spacing: number;
    }>;
  };
  options: {
    cutout: number;
  };
}

// Function to get the sum of transactions
export function getSum(transactions: Transaction[], type?: string): SummedData[] {
  const sum = _(transactions)
    .groupBy("type")
    .map((objs, key) => {
      if (!type || key === type) {
        return {
          type: key,
          color: objs[0].color, // Assuming all transactions in the group have the same color
          total: _.sumBy(objs, "amount"),
        };
      }
    })
    .compact() // Remove undefined values
    .value();

  return sum as SummedData[]; // Ensure the return type matches SummedData[]
}

// Function to get chart configuration
export function chartData(
  transactions: Transaction[],
  custom?: ChartConfig
): ChartConfig {
  const dataValue = getSum(transactions);
  let bg = _.map(transactions, (t) => t.color);
  bg = _.uniq(bg);

  const config: ChartConfig = {
    data: {
      datasets: [
        {
          data: _.map(dataValue, (item) => item.total),
          backgroundColor: bg,
          hoverOffset: 4,
          borderRadius: 30,
          spacing: 10,
        },
      ],
    },
    options: {
      cutout: 115,
    },
  };

  return custom ?? config;
}

// Function to get labels with percentages
export function getLabels(transactions: Transaction[]): SummedData[] {
  const amountSum = getSum(transactions);
  const Total = getTotal(transactions);

  const percent = _(amountSum)
    .map((obj) =>
      _.assign(obj, { percent: (100 * obj.total) / Total })
    )
    .value();

  return percent;
}

// Function to calculate the total sum of all transactions
export function getTotal(transactions: Transaction[]): number {
  const summedData = getSum(transactions);
  const total = _.sumBy(summedData, "total");
  return total;
}
