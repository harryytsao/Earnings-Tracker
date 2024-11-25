export async function getUpcomingEarnings() {
  // In a real application, you would fetch this data from an API
  return [
    {
      date: "2023-06-01",
      time: "After Market Close",
      company: "Acme Corp",
      symbol: "ACME",
      estimatedEPS: 1.23,
    },
    {
      date: "2023-06-02",
      time: "Before Market Open",
      company: "Beta Industries",
      symbol: "BETA",
      estimatedEPS: 0.87,
    },
    {
      date: "2023-06-02",
      time: "After Market Close",
      company: "Gamma Technologies",
      symbol: "GAMA",
      estimatedEPS: 2.1,
    },
    {
      date: "2023-06-05",
      time: "Before Market Open",
      company: "Delta Systems",
      symbol: "DLTA",
      estimatedEPS: 0.56,
    },
    {
      date: "2023-06-05",
      time: "After Market Close",
      company: "Epsilon Software",
      symbol: "EPSN",
      estimatedEPS: 1.78,
    },
  ];
}
