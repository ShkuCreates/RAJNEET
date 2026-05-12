import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to fetch from multiple cricket data sources
    const sources = [
      {
        url: 'https://www.cricbuzz.com/api/cricket/league/ipl-mens-ipl-2024/matches',
        parser: (data: any) => {
          if (!data.matches) return [];
          return data.matches
            .filter((m: any) => m.status === 'live' || m.status === 'scheduled' || m.status === 'completed')
            .map((m: any) => ({
              id: m.id,
              team1: m.team1?.name || 'Team 1',
              team2: m.team2?.name || 'Team 2',
              score1: m.team1?.score || '0/0',
              score2: m.team2?.score || '0/0',
              status: m.status?.toUpperCase() || 'UNKNOWN',
              overs: `${m.team1?.overs || '0.0'} / ${m.team2?.overs || '0.0'}`,
              venue: m.venue || 'Unknown',
              timestamp: m.startTime || new Date().toISOString()
            }));
        }
      },
      {
        url: 'https://cricbuzz.com/api/v1/matches',
        parser: (data: any) => {
          if (!data.matches) return [];
          return data.matches
            .filter((m: any) => m.series?.toLowerCase().includes('ipl'))
            .map((m: any) => ({
              id: m.id,
              team1: m.team1?.name || m.t1 || 'Team 1',
              team2: m.team2?.name || m.t2 || 'Team 2',
              score1: m.team1?.score || m.t1s || '0/0',
              score2: m.team2?.score || m.t2s || '0/0',
              status: m.status?.toUpperCase() || 'UNKNOWN',
              overs: `${m.team1?.overs || m.t1s?.split('(')[0] || '0.0'} / ${m.team2?.overs || m.t2s?.split('(')[0] || '0.0'}`,
              venue: m.venue || m.stadium || 'Unknown',
              timestamp: m.startTime || m.dateTimeGMT || new Date().toISOString()
            }));
        }
      }
    ];

    let matches = [];

    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          const parsedMatches = source.parser(data);
          if (parsedMatches.length > 0) {
            matches = parsedMatches;
            break;
          }
        }
      } catch (err) {
        console.log(`Source ${source.url} failed:`, err);
        continue;
      }
    }

    // If no matches found, return sample IPL data
    if (matches.length === 0) {
      matches = [
        {
          id: '1',
          team1: 'CSK',
          team2: 'MI',
          score1: '185/4',
          score2: '180/6',
          status: 'LIVE',
          overs: '18.2 / 19.4',
          venue: 'Chennai',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          team1: 'RCB',
          team2: 'KKR',
          score1: '0/0',
          score2: '0/0',
          status: 'SCHEDULED',
          overs: '0.0 / 0.0',
          venue: 'Bangalore',
          timestamp: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: '3',
          team1: 'DC',
          team2: 'SRH',
          score1: '172/5',
          score2: '175/3',
          status: 'COMPLETED',
          overs: '20.0 / 19.2',
          venue: 'Delhi',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }

    return NextResponse.json({ 
      success: true, 
      matches,
      source: matches.length > 0 ? 'api' : 'sample'
    });
  } catch (error) {
    console.error('Cricket scores API error:', error);
    
    // Return sample data on error
    const sampleMatches = [
      {
        id: '1',
        team1: 'CSK',
        team2: 'MI',
        score1: '185/4',
        score2: '180/6',
        status: 'LIVE',
        overs: '18.2 / 19.4',
        venue: 'Chennai',
        timestamp: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      success: false, 
      matches: sampleMatches,
      source: 'sample',
      error: 'API unavailable - showing sample data'
    });
  }
}
