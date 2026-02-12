import { Component } from '@angular/core';

interface BenefitCard {
  icon: string;
  title: string;
  features: string[];
}

@Component({
  selector: 'app-sell-with-us',
  templateUrl: './sell-with-us.component.html',
  styleUrls: ['./sell-with-us.component.scss']
})
export class SellWithUsComponent {
 benefits: BenefitCard[] = [
    {
      icon: 'users',
      title: '1600+ customers',
      features: [
        '1600+ customers across India',
        '53% are repeat customers',
        'Reachable through Organic search',
        'Conversion rate of 1.1%'
      ]
    },
    {
      icon: 'location',
      title: 'Sell across India',
      features: [
        '28+ states covered across India',
        'Free email marketing',
        'Free social media marketing',
        'Free organic search linking'
      ]
    },
    {
      icon: 'money',
      title: 'No setup fee',
      features: [
        'Zero setup fees',
        'Pay only if you make a sale',
        'Payment release on dispatch',
        'Easy on boarding and documentation'
      ]
    }
  ];
}
