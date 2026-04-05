const analyticsStore = {
  pageStats: {},
  recentVisits: [],
  totalVisitors: 0,
  activeSessions: {}
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

exports.trackVisit = (req, res) => {
  const { page, duration, sessionId } = req.body;

  if (!page || !sessionId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields."
    });
  }

  const today = getTodayKey();

  if (!analyticsStore.pageStats[page]) {
    analyticsStore.pageStats[page] = {
      visits: 0,
      totalTime: 0,
      lastVisited: null,
      daily: {}
    };
  }

  if (!analyticsStore.pageStats[page].daily[today]) {
    analyticsStore.pageStats[page].daily[today] = {
      visits: 0,
      totalTime: 0
    };
  }

  analyticsStore.pageStats[page].visits += 1;
  analyticsStore.pageStats[page].totalTime += Number(duration || 0);
  analyticsStore.pageStats[page].lastVisited = new Date().toISOString();

  analyticsStore.pageStats[page].daily[today].visits += 1;
  analyticsStore.pageStats[page].daily[today].totalTime += Number(duration || 0);

  if (!analyticsStore.activeSessions[sessionId]) {
    analyticsStore.totalVisitors += 1;
  }

  analyticsStore.activeSessions[sessionId] = {
    page,
    lastSeen: Date.now()
  };

  analyticsStore.recentVisits.unshift({
    page,
    duration: Number(duration || 0),
    sessionId,
    timestamp: new Date().toISOString()
  });

  analyticsStore.recentVisits = analyticsStore.recentVisits.slice(0, 50);

  return res.json({
    success: true
  });
};

exports.getReport = (req, res) => {
  const now = Date.now();

  let activeUsers = 0;
  Object.values(analyticsStore.activeSessions).forEach((session) => {
    if (now - session.lastSeen < 5 * 60 * 1000) {
      activeUsers += 1;
    }
  });

  const pageReport = Object.entries(analyticsStore.pageStats).map(([page, data]) => {
    const avgTime = data.visits > 0 ? (data.totalTime / data.visits).toFixed(2) : 0;

    return {
      page,
      visits: data.visits,
      totalTime: Number(data.totalTime.toFixed(2)),
      avgTime: Number(avgTime),
      lastVisited: data.lastVisited
    };
  });

  pageReport.sort((a, b) => b.visits - a.visits);

  return res.json({
    success: true,
    totalVisitors: analyticsStore.totalVisitors,
    activeUsers,
    pages: pageReport,
    recentVisits: analyticsStore.recentVisits
  });
};