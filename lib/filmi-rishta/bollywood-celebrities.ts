// Curated list of popular Bollywood celebrities with real IMDB IDs
// This ensures the game works with actual IMDB data

export interface BollywoodCelebrity {
  id: string; // IMDB ID
  name: string;
  popularName?: string;
  birthYear?: number;
  popularity: 'high' | 'medium' | 'low'; // For generating balanced challenges
  era: 'classic' | '90s' | '2000s' | 'modern'; // For era-based challenges
}

export const BOLLYWOOD_CELEBRITIES: BollywoodCelebrity[] = [
  // High popularity stars (frequently connected)
  {
    id: 'nm0451321', // Shah Rukh Khan
    name: 'Shah Rukh Khan',
    popularName: 'SRK',
    birthYear: 1965,
    popularity: 'high',
    era: '90s',
  },
  {
    id: 'nm1659547', // Deepika Padukone
    name: 'Deepika Padukone',
    birthYear: 1986,
    popularity: 'high',
    era: 'modern',
  },
  {
    id: 'nm0451148', // Aamir Khan
    name: 'Aamir Khan',
    birthYear: 1965,
    popularity: 'high',
    era: '90s',
  },
  {
    id: 'nm1550948', // Priyanka Chopra
    name: 'Priyanka Chopra',
    birthYear: 1982,
    popularity: 'high',
    era: '2000s',
  },
  {
    id: 'nm0439939', // Akshay Kumar
    name: 'Akshay Kumar',
    birthYear: 1967,
    popularity: 'high',
    era: '90s',
  },
  {
    id: 'nm2952832', // Katrina Kaif
    name: 'Katrina Kaif',
    birthYear: 1983,
    popularity: 'high',
    era: '2000s',
  },
  {
    id: 'nm3153404', // Ranveer Singh
    name: 'Ranveer Singh',
    birthYear: 1985,
    popularity: 'high',
    era: 'modern',
  },
  {
    id: 'nm5156190', // Alia Bhatt
    name: 'Alia Bhatt',
    birthYear: 1993,
    popularity: 'high',
    era: 'modern',
  },
  {
    id: 'nm0396558', // Hrithik Roshan
    name: 'Hrithik Roshan',
    birthYear: 1974,
    popularity: 'high',
    era: '2000s',
  },
  {
    id: 'nm0451234', // Salman Khan
    name: 'Salman Khan',
    birthYear: 1965,
    popularity: 'high',
    era: '90s',
  },
  
  // Medium popularity stars
  {
    id: 'nm0451102', // Kajol
    name: 'Kajol',
    birthYear: 1974,
    popularity: 'medium',
    era: '90s',
  },
  {
    id: 'nm0000821', // Amitabh Bachchan
    name: 'Amitabh Bachchan',
    birthYear: 1942,
    popularity: 'high',
    era: 'classic',
  },
  {
    id: 'nm0451637', // Ranbir Kapoor
    name: 'Ranbir Kapoor',
    birthYear: 1982,
    popularity: 'high',
    era: 'modern',
  },
  {
    id: 'nm0000831', // Aishwarya Rai
    name: 'Aishwarya Rai Bachchan',
    popularName: 'Aishwarya Rai',
    birthYear: 1973,
    popularity: 'high',
    era: '90s',
  },
  {
    id: 'nm0451175', // Kareena Kapoor
    name: 'Kareena Kapoor Khan',
    popularName: 'Kareena Kapoor',
    birthYear: 1980,
    popularity: 'high',
    era: '2000s',
  },
  {
    id: 'nm0451243', // Saif Ali Khan
    name: 'Saif Ali Khan',
    birthYear: 1970,
    popularity: 'medium',
    era: '90s',
  },
  {
    id: 'nm0004435', // Madhuri Dixit
    name: 'Madhuri Dixit',
    birthYear: 1967,
    popularity: 'high',
    era: '90s',
  },
  {
    id: 'nm3749693', // Anushka Sharma
    name: 'Anushka Sharma',
    birthYear: 1988,
    popularity: 'medium',
    era: 'modern',
  },
  {
    id: 'nm2550712', // Varun Dhawan
    name: 'Varun Dhawan',
    birthYear: 1987,
    popularity: 'medium',
    era: 'modern',
  },
  {
    id: 'nm3767077', // Arjun Kapoor
    name: 'Arjun Kapoor',
    birthYear: 1985,
    popularity: 'medium',
    era: 'modern',
  },
  {
    id: 'nm1476917', // Sonam Kapoor
    name: 'Sonam Kapoor',
    birthYear: 1985,
    popularity: 'medium',
    era: 'modern',
  },
  {
    id: 'nm2794962', // Parineeti Chopra
    name: 'Parineeti Chopra',
    birthYear: 1988,
    popularity: 'medium',
    era: 'modern',
  },
  {
    id: 'nm2142336', // Shahid Kapoor
    name: 'Shahid Kapoor',
    birthYear: 1981,
    popularity: 'medium',
    era: '2000s',
  },
  {
    id: 'nm1411676', // Vidya Balan
    name: 'Vidya Balan',
    birthYear: 1979,
    popularity: 'medium',
    era: '2000s',
  },
  {
    id: 'nm2394661', // Kangana Ranaut
    name: 'Kangana Ranaut',
    birthYear: 1987,
    popularity: 'medium',
    era: 'modern',
  },
  
  // Classic era stars
  {
    id: 'nm0000825', // Rekha
    name: 'Rekha',
    birthYear: 1954,
    popularity: 'medium',
    era: 'classic',
  },
  {
    id: 'nm0451212', // Jeetendra
    name: 'Jeetendra',
    birthYear: 1942,
    popularity: 'medium',
    era: 'classic',
  },
  {
    id: 'nm0451194', // Dharmendra
    name: 'Dharmendra',
    birthYear: 1935,
    popularity: 'medium',
    era: 'classic',
  },
  {
    id: 'nm0451181', // Hema Malini
    name: 'Hema Malini',
    birthYear: 1948,
    popularity: 'medium',
    era: 'classic',
  },
  {
    id: 'nm0451364', // Rajesh Khanna
    name: 'Rajesh Khanna',
    birthYear: 1942,
    popularity: 'medium',
    era: 'classic',
  },
];

// Helper functions for challenge generation
export function getCelebritiesByPopularity(popularity: 'high' | 'medium' | 'low'): BollywoodCelebrity[] {
  return BOLLYWOOD_CELEBRITIES.filter(celebrity => celebrity.popularity === popularity);
}

export function getCelebritiesByEra(era: 'classic' | '90s' | '2000s' | 'modern'): BollywoodCelebrity[] {
  return BOLLYWOOD_CELEBRITIES.filter(celebrity => celebrity.era === era);
}

export function getRandomCelebrity(): BollywoodCelebrity {
  return BOLLYWOOD_CELEBRITIES[Math.floor(Math.random() * BOLLYWOOD_CELEBRITIES.length)];
}

export function getRandomCelebrityPair(difficulty: 'easy' | 'medium' | 'hard'): [BollywoodCelebrity, BollywoodCelebrity] {
  let celebrity1: BollywoodCelebrity;
  let celebrity2: BollywoodCelebrity;

  switch (difficulty) {
    case 'easy':
      // For easy, pick high popularity celebrities from same era
      const highPopCelebrities = getCelebritiesByPopularity('high');
      celebrity1 = highPopCelebrities[Math.floor(Math.random() * highPopCelebrities.length)];
      
      // Try to find someone from the same era
      const sameEraCelebrities = highPopCelebrities.filter(c => 
        c.era === celebrity1.era && c.id !== celebrity1.id
      );
      
      if (sameEraCelebrities.length > 0) {
        celebrity2 = sameEraCelebrities[Math.floor(Math.random() * sameEraCelebrities.length)];
      } else {
        celebrity2 = highPopCelebrities.find(c => c.id !== celebrity1.id) || highPopCelebrities[0];
      }
      break;

    case 'medium':
      // For medium, mix high and medium popularity
      const mediumPoolCelebrities = [
        ...getCelebritiesByPopularity('high'),
        ...getCelebritiesByPopularity('medium')
      ];
      celebrity1 = mediumPoolCelebrities[Math.floor(Math.random() * mediumPoolCelebrities.length)];
      celebrity2 = mediumPoolCelebrities.find(c => c.id !== celebrity1.id) || mediumPoolCelebrities[0];
      break;

    case 'hard':
      // For hard, pick from different eras or lower popularity
      celebrity1 = getRandomCelebrity();
      
      // Try to find someone from a different era
      const differentEraCelebrities = BOLLYWOOD_CELEBRITIES.filter(c => 
        c.era !== celebrity1.era && c.id !== celebrity1.id
      );
      
      if (differentEraCelebrities.length > 0) {
        celebrity2 = differentEraCelebrities[Math.floor(Math.random() * differentEraCelebrities.length)];
      } else {
        celebrity2 = BOLLYWOOD_CELEBRITIES.find(c => c.id !== celebrity1.id) || BOLLYWOOD_CELEBRITIES[0];
      }
      break;

    default:
      celebrity1 = getRandomCelebrity();
      celebrity2 = BOLLYWOOD_CELEBRITIES.find(c => c.id !== celebrity1.id) || BOLLYWOOD_CELEBRITIES[0];
  }

  return [celebrity1, celebrity2];
} 