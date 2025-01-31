export  interface Place {
    lat: number;
    lon: number;
    tags: {
      name: string;
      [key: string]: string | undefined;
    };
  }

  export  interface Company {
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
    website: string;
    phone: string;
    opening_hours: string;
  }