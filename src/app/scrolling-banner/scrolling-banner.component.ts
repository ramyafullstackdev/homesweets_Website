import { Component } from '@angular/core';
import { BannerOffer } from './interface';


@Component({
  selector: 'app-scrolling-banner',
  templateUrl: './scrolling-banner.component.html',
  styleUrls: ['./scrolling-banner.component.scss']
})
export class ScrollingBannerComponent {
  countdownInterval: any;
  bannerOffers: BannerOffer[] = [
    {
      id: 1,
      icon: 'fas fa-gift',
      iconColor: '#FFD700',
      text: 'Mega Combo Use Code : ',
      code: 'TASTE15',
      discount: '& Get 15% Off',
      targetDateTime: '2025-06-20T21:00:00'
    },
    {
      id: 2,
      icon: 'fas fa-star',
      iconColor: '#FF69B4',
      text: 'Extra 10% OFF USE CODE : ',
      code: 'WELCOME',
      discount: 'On Orders above ₹999',
      targetDateTime: '2025-06-19T10:00:00'
    },
    {
      id: 3,
      icon: 'fas fa-fire',
      iconColor: '#FF4500',
      text: 'Taste of the Month ',
      discount: 'Special Discount Available',
      targetDateTime: '2025-06-18T12:00:00'
    },
    {
      id: 4,
      icon: 'fas fa-truck',
      iconColor: '#00CED1',
      text: 'FREE DELIVERY USE CODE : ',
      code: 'FREEDEL',
      discount: 'On Orders Above ₹499',
      targetDateTime: '2025-06-17T23:59:59'
    },
    {
      id: 5,
      icon: 'fas fa-tags',
      iconColor: '#32CD32',
      text: 'Buy 2 Get 1 FREE USE CODE : ',
      code: 'BUY2GET1',
      discount: 'On Selected Items',
      targetDateTime: '2025-06-16T16:00:00'
    }
  ];


  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  trackByOfferId(index: number, offer: BannerOffer): number {
    return offer.id;
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();

      this.bannerOffers = this.bannerOffers.map((offer) => {
        if (!offer.targetDateTime) return offer;

        const targetTime = new Date(offer.targetDateTime).getTime();
        let diff = targetTime - now;

        if (diff <= 0) {
          offer.countdown = 'Expired';
          return offer;
        }

        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        diff %= (1000 * 60 * 60);
        const minutes = Math.floor(diff / (1000 * 60));
        diff %= (1000 * 60);
        const seconds = Math.floor(diff / 1000);

        offer.countdown = `${this.pad(totalHours)}H ${this.pad(minutes)}M ${this.pad(seconds)}S`;
        return offer;
      });
    }, 1000);
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

}
