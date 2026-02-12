import { Component } from '@angular/core';

@Component({
  selector: 'app-our-story',
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss']
})
export class OurStoryComponent {

  promiseCards = [
    {
      image: 'assets/images/share.png',
      title: 'Sharing Beyond Shopping',
      description: 'Every order you make gifts a festive box to someone in need.',
      color: 'pink'
    },
    {
      image: 'assets/images/happy.png',
      title: 'Happiness Multiplied',
      description: 'Thousands of boxes delivered, spreading smiles and festive warmth across homes.',
      color: 'purple'
    },
    {
      image: 'assets/images/donatee.png',
      title: '1M+ Reasons To Celebrate',
      description: 'Over a million happy customers worldwide, united in a circle of joy',
      color: 'green'
    }
  ];

  stats = {
    countries: '50+',
    doors: '100,000+'
  };

  makers = [
    'assets/images/k1.jpg',
    'assets/images/k2.jpg',
    'assets/images/k3.jpg',
    'assets/images/k4.jpg',
    'assets/images/k5.jpg',
    'assets/images/k7.jpg'
  ];

  constructor() { }

  ngOnInit(): void {
    this.setupScrollAnimations();
  }

  setupScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
      document.querySelectorAll('.fade-in-section').forEach(el => {
        observer.observe(el);
      });
    }, 100);
  }
}
