export interface BannerOffer {
  id: number;
  text: string;
  code?: string;
  discount?: string;
  targetDateTime?: string; 
  countdown?: string; 
  link?: string;
  icon?: string;
  iconColor: string;
}
export interface CountryCode {
    name: string;
    flag: string;
    code: string;
    dial_code: string;
    phone_min_length: number;
    phone_max_length: number;
}