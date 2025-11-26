export type Language = 'zh-TW' | 'zh-CN';

export interface Translations {
  // Common
  common: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    add: string;
    update: string;
    back: string;
    next: string;
    done: string;
    total: string;
  };
  
  // Navigation
  navigation: {
    home: string;
    game: string;
    settings: string;
  };
  
  // Home Screen
  home: {
    title: string;
    noGames: string;
    newGame: string;
    totalBuyIn: string;
    players: string;
    currentProfit: string;
    finalProfit: string;
    gameList: string;
    startTime: string;
    inProgressTime: string;
    duration: string;
    active: string;
    completed: string;
  };
  
  // Game Screen
  game: {
    title: string;
    currentGame: string;
    noGameInProgress: string;
    newGame: string;
    players: string;
    playersInProgress: string;
    addPlayer: string;
    deletePlayer: string;
    confirmDelete: string;
    buyIn: string;
    inProgress: string;
    cashedOut: string;
    totalBuyIn: string;
    profit: string;
    dealer: string;
    functions: {
      buyInCashOut: string;
      rake: string;
      expense: string;
      insurance: string;
      dealer: string;
      entryFee: string;
    };
  };
  
  // Welcome Screen
  welcome: {
    subtitle: string;
    feature1: string;
    feature2: string;
    feature3: string;
    getStarted: string;
    privacy: string;
  };
  
  // Auth
  auth: {
    email: string;
    password: string;
    name: string;
    enterEmail: string;
    enterPassword: string;
    enterName: string;
    forgotPassword: string;
    login: string;
    signup: string;
    loginWithApple: string;
    loginWithGoogle: string;
    signupWithApple: string;
    signupWithGoogle: string;
    or: string;
    noAccount: string;
    signupForFree: string;
    haveAccount: string;
    loginHere: string;
    acceptTerms: string;
    termsOfService: string;
    privacyPolicy: string;
    loginFailed: string;
    signupFailed: string;
    errorEmailRequired: string;
    errorPasswordRequired: string;
    errorNameRequired: string;
    errorTermsRequired: string;
    errorInvalidEmail: string;
    errorInvalidPassword: string;
  };
  
  // Settings Screen
  settings: {
    title: string;
    general: string;
    language: string;
    traditionalChinese: string;
    simplifiedChinese: string;
    colorMode: string;
    lightMode: string;
    darkMode: string;
    currentlyUsing: string;
    collaboration: string;
    collaborationStatus: string;
    connected: string;
    disconnected: string;
    connectedUsers: string;
    conflictResolution: string;
    autoMerge: string;
    manualHandle: string;
    lastSync: string;
    dataManagement: string;
    exportData: string;
    exportDataSubtitle: string;
    backupData: string;
    backupDataSubtitle: string;
    about: string;
    version: string;
    developer: string;
    lastUpdate: string;
    privacyPolicy: string;
    termsOfService: string;
    login: string;
    loggedIn: string;
    logout: string;
    loginWithApple: string;
    loginWithGoogle: string;
    loginWithEmail: string;
  };
  
  // Modals
  modals: {
    newGame: string;
    buyIn: string;
    cashOut: string;
    expense: string;
    rake: string;
    insurance: string;
    dealer: string;
    gameSummary: string;
    endGame: string;
    editBuyIn: string;
    buyInAmount: string;
  };
  
  // Expense Categories
  expenseCategories: {
    takeout: string;
    miscellaneous: string;
    taxi: string;
    venue: string;
    other: string;
  };
  
  // Game Summary
  summary: {
    gameInfo: string;
    gameName: string;
    startTime: string;
    endTime: string;
    gameDuration: string;
    playerCount: string;
    blinds: string;
    financialStatement: string;
    totalBuyIn: string;
    totalCashOut: string;
    totalRake: string;
    totalEntryFee: string;
    totalTips: string;
    totalExpenses: string;
    dealerSalary: string;
    insuranceProfitLoss: string;
    netIncome: string;
    actualReceipts: string;
    balanced: string;
    unbalanced: string;
    playerList: string;
    expenseRecords: string;
    noExpenseRecords: string;
    settlementDetails: string;
    hostPayout: string;
    insuranceRecords: string;
    exportSummary: string;
    entryFeeDetails: string;
    free: string;
  };
  
  // Player Details
  playerDetails: {
    buyIn: string;
    totalBuyIn: string;
    buyInRecords: string;
    addBuyIn: string;
    amount: string;
    deleteConfirm: string;
    editBuyInAmount: string;
  };
  
  // Cash Out
  cashOut: {
    selectPlayer: string;
    noActivePlayers: string;
    player: string;
    chipsAmount: string;
    enterAmount: string;
    selectHost: string;
    selectHostHint: string;
    errorNoGame: string;
    errorPlayerRequired: string;
    errorAmountRequired: string;
    errorHostRequired: string;
    successCashOut: string;
  };
  
  // Expense
  expense: {
    category: string;
    description: string;
    descriptionPlaceholder: string;
    amount: string;
    amountPlaceholder: string;
    selectHost: string;
    addExpense: string;
    updateExpense: string;
    records: string;
    noRecords: string;
    editExpense: string;
    deleteExpense: string;
    deleteConfirm: string;
  };
  
  // Dealer
  dealer: {
    addDealer: string;
    dealerName: string;
    tipShare: string;
    hourlyRate: string;
    workHours: string;
    startTime: string;
    endTime: string;
    working: string;
    offDuty: string;
    addWorkHoursTips: string;
    workHoursAutoCalc: string;
    totalTips: string;
    shareRatio: string;
    perHour: string;
    errorNoGame: string;
    errorNameRequired: string;
    errorRateRequired: string;
    errorHoursRequired: string;
    errorWorkHoursInvalid: string;
    errorTimeRequired: string;
    errorTipsRequired: string;
    errorTimeInvalid: string;
    enterWorkHours: string;
    successAdded: string;
    successUpdated: string;
    cancel: string;
    confirm: string;
    exampleTime: string;
    noDealers: string;
    deleteConfirm: string;
  };
  
  // Rake
  rake: {
    amount: string;
    amountPlaceholder: string;
    time: string;
    timePlaceholder: string;
    recordRake: string;
    viewRecords: string;
    currentStats: string;
    totalCount: string;
    totalAmount: string;
    average: string;
    times: string;
    errorNoGame: string;
    errorAmountRequired: string;
    successRecorded: string;
    rakeAmount: string;
    deleteRake: string;
    deleteConfirm: string;
    noRecords: string;
  };
  
  // Insurance
  insurance: {
    defaultPartners: string;
    setDefault: string;
    partnerName: string;
    namePlaceholder: string;
    percentage: string;
    addPartner: string;
    totalPercentage: string;
    valid: string;
    exceeded: string;
    needs100: string;
    saveDefault: string;
    errorDefaultRequired: string;
    successDefaultSaved: string;
    insuranceAmount: string;
    insuranceAmountPlaceholder: string;
    quickButtons: string;
    addInsurance: string;
    errorNoGame: string;
    errorAmountRequired: string;
    errorPartnersRequired: string;
    errorPercentageRequired: string;
    errorTotalPercentage: string;
    successRecorded: string;
    modify: string;
    delete: string;
    deleteConfirm: string;
    noRecords: string;
  };
  
  // Summary Export
  summaryExport: {
    gameSummary: string;
    start: string;
    end: string;
    financialReport: string;
    expenseRecords: string;
    none: string;
    settlementDetails: string;
    hours: string;
    minutes: string;
    people: string;
  };
  
  // Errors
  errors: {
    noGame: string;
    required: string;
    invalid: string;
  };
  
  // Success
  success: {
    saved: string;
    updated: string;
    deleted: string;
  };
  
  // Entry Fee
  entryFee: {
    title: string;
    mode: string;
    unifiedEntryFee: string;
    customHourly: string;
    fixedEntryFee: string;
    fixedEntryFeePlaceholder: string;
    fixedEntryFeeDescription: string;
    hourlyRate: string;
    hourlyRatePlaceholder: string;
    hourlyRateDescription: string;
    errorNoGame: string;
    errorEntryFeeRequired: string;
    errorHourlyRateRequired: string;
    errorSaveFailed: string;
    successSaved: string;
    playerCharges: string;
    noPlayers: string;
    pending: string;
    editPlayerFee: string;
    playerName: string;
    customEntryFee: string;
    calculatedFee: string;
    enterCustomFee: string;
    custom: string;
    selectAll: string;
  };
  
  // New Game
  newGame: {
    gameName: string;
    gameNamePlaceholder: string;
    hostName: string;
    hostNamePlaceholder: string;
    removeHost: string;
    addHost: string;
    smallBlind: string;
    bigBlind: string;
    createGame: string;
    errorNameRequired: string;
    errorHostRequired: string;
    errorBlindMin: string;
    errorCreateFailed: string;
    rakeMode: string;
    noRakeMode: string;
    rakeModeDescription: string;
    noRakeModeDescription: string;
  };
  
  // Buy In
  buyIn: {
    newPlayer: string;
    existingPlayer: string;
    playerName: string;
    playerNamePlaceholder: string;
    selectPlayer: string;
    noPlayers: string;
    amount: string;
    amountPlaceholder: string;
    confirmBuyIn: string;
    errorNoGame: string;
    errorAmountRequired: string;
    errorPlayerNameRequired: string;
    errorPlayerRequired: string;
    successPlayerAdded: string;
    successBuyInAdded: string;
  };
  
  // End Game
  endGame: {
    noGame: string;
    warningMessage: string;
    confirmEnd: string;
    errorEndFailed: string;
    hours: string;
    minutes: string;
  };
  
  // In Out
  inOut: {
    buyIn: string;
    cashOut: string;
  };
}

