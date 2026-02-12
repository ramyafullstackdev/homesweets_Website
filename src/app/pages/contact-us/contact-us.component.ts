import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ContactMethod {
  icon: string;
  title: string;
  description: string;
  contactInfo: string;
  type: 'phone' | 'mail' | 'chat'; 
}

interface Location {
  country: string;
  flag: string;
  name: string;
  address: string[];
}


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
 contactForm!: FormGroup;
  submitted = false;

contactMethods: ContactMethod[] = [
  {
    icon: 'phone',
    title: 'Call Us',
    description: 'Mon-Sat from 10am to 6pm.',
    contactInfo: '+91 98765 43210',
    type: 'phone'
  },
  {
    icon: 'mail',
    title: 'Write a Mail',
    description: 'Your Words Matter to Us',
    contactInfo: 'support@yourmail.com',
    type: 'mail'
  },
  {
    icon: 'chat',
    title: 'Chat Us',
    description: "We're here to help.",
    contactInfo: '+91 98765 43210',
    type: 'chat'
  }
];


  locations: Location[] = [
    {
      country: 'INDIA',
      flag: '🇮🇳',
      name: 'Oorla',
      address: [
        'No.15-1, VLB Nagar,',
        'Kulathupalayam,',
        'Kovaipudhur',
        'Coimbatore, TN IND'
      ]
    },
    {
      country: 'USA',
      flag: '🇺🇸',
      name: 'Oorla',
      address: [
        '10, Schalks Crossing Rd,',
        'Plainsboro,',
        'NJ 08536',
        'USA'
      ]
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    console.log('Form submitted:', this.contactForm.value);

    this.contactForm.reset();
    this.submitted = false;
  }
}