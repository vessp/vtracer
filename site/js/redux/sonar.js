import Immutable from 'immutable'


function initialState(clue) {
  return Immutable.fromJS({
    clue: clue,
    showSpinner: true, //start with showing spinner

    //frame items
    title: '',
    headerLinks:[],
    hasSubsetCreationControl: false,
    hasPrintControl: false,
    hasAnalysisFrameText: false,
    hasPublishAnalysisMenu: false,

    //config
    isDocRadar: false,
    hasSidebar: false,
    hasPatentList: false,
    hasPinsControl: false,
    hasStickysControl: false,
    hasWhiteSpaceControl: false,
    hasAreaSelectionControl: false,
    hasSettingsControl: false,
    hasOrgSelectControl: false,
    hasCrosshairs: false,
    hasLegend: false,
    hasZoomControls: false,
    hasMagnificationControls: false,
    canPan: false,
    hasAnalysisInfo: false,
    hasClusterSelect: false,
    hasClusterTooltips: false,

    viewport: {
      zoom: 1,
      magnification: 1,
      clusterRadiusBase: 1,
      chartOffsetX: 0,
      chartOffsetY: 0,
      chartSize: 0,

      //set from radar, bounding rect of radar container
      radarRect: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
      },
    },
    invertYAxis: clue.isCompetitive,
    shapeConfig: null, //set from chart

    openSidebarTabKey: null,
    activeOverlay: null, //{type:... payload:...}

    usingPinsTool: false,
    usingStickysTool: false,
    usingAreaSelectionTool: false,
    usingAreaDrawingTool: false,

    showingLayers: {
      uiControls: true,
      drawings: true,
      pins: true,
      stickys: true,
      clusters: true,
      contours: true,
      areas: true,
      background: true,
      keywordZones: true,
      trendLines: true,
      orgCenters: true,
      textPlots: true,
      remarkableSelections: false,
    },

    permissions: null,

    summary: null,
    summaryStats: null,
    areaAnalysis: null,
    analysisStatisticsIsOperating: false,

    population: null, //competitive version of activeAnalysis

    clusters: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      hoveredId: null,
      sightedId: null,
      // selectedIds: Immutable.Set(),
      selected: Immutable.OrderedMap(),
      markedIds: Immutable.Set(), //used in PatentList

      tooltipCluster: null,
      tooltipX: null,
      tooltipY: null,

      showSiftedOnly: false,
      siftingOperator: 'or', //or, and
      sifted: null,

      maxCount: null,
      minCount: null,
      maxDim: null,
      farthest: null,
      nearest: null,
      largest: null,
    },
    clusterRecords: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),
    },
    areas: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      hoveredId: null,
      sightedId: null,
      editingArea: null,
      selected: null, //not a list
      selectedPosX: null, //mouse coord of the selection
      selectedPosY: null, //mouse coord of the selection

      patentListFilteringArea: null,
    },
    filters: {
      applyed: null,
      available: null,

      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      applyingIds: Immutable.Set(), //applying or dissolving ids

      clusterStylers: null,
      formOptions: null,
      editingFilter: null, //filter object which is currently being edited
    },
    drawings: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      sightedId: null,
      editingDrawing: null,
      editingShapeIndex: null,
      activeShapeTool: null, //string
    },
    contours: {
      isOperating: false,
      error: null,

      grid: null,
      xRange: null,
      yRange: null,

      numSteps: null,
      botLevel: null,
      topLevel: null,

      digest: null,
      autoUpdate: true,
    },
    pins: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      editingPin: null,
    },
    stickys: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      editingSticky: null,
    },
    textPlots: {
      all: null,
      error: null,
      isOperating: false,

      isFetching: false,
      fetchingCount: 0,

      isPosting: false,
      postingCount: 0,

      isPatching: false,
      patchingCount: 0,
      patchingIds: Immutable.Set(),

      isDeleting: false,
      deletingCount: 0,
      deletingIds: Immutable.Set(),

      editingTextPlot: null,
    },
    swot: {
      isOperating: false,

      dataMap: null,

      actives: Immutable.Map(),
    },
    clusterTrends: {
      isOperating: false,

      activeNewest: Immutable.Map(),
      activeLargest: Immutable.Map(),
      activeNearest: Immutable.Map(),
    },
    keywordZones: {
      isOperating: false,

      activeType: null,
      activeIndex: null
    },
    graphs: {
      isOperating: false,
      isFetching: false,
      isPopulated: false,

      orgCenters: null,
      activeOrgCenters:  Immutable.Map(),
    },
    noteworthy: {
      isOperating: false,
      isFetching: false,
      error: null,

      dataMap: null,
    },
    trendLines: {
      isOperating: false,
      isFetching: false,
      error: null,

      dataMap: null,
      labels: null,

      actives: Immutable.Map(),
      tooltipPoint: null,
    },

    //TraitMounds
    applicants: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Applicants',
    },
    organizations: { //docRadarのapplicants
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Organizations',
    },
    inventors: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Inventors',
    },
    persons: { //docRadarのinventors
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Persons',
    },
    years: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Years',
    },
    ipcs: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'IPCs',
    },
    keywords: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Words',
      indicatorClass: 'keywords',
    },
    compoundKeywords: {
      all: null,
      isEnabled: false,
      actives: Immutable.Map(),
      title: 'Compound Words',
      indicatorClass: 'keywords',
    },

    //Subsets (recalculation)
    isRequestingDataSubsetByFilter: false,
    subsetByFilterFieldNames: null,
    subsetByFilterConditions: null, 

    isRequestingDataSubsetByAggregation: false,
    aggregationRules: null,
    aggregationFieldNames: null,

    isRecalculating: false,
    recalculationDatasetId: null,

    targetOrgs: {
      isOperating: false,
      isFetching: false,
      error: null,

      allNames: null, //all org names
      currentTarget: null,
      competitors: null, //20 selected orgs (can see in overview graphs)
    },

  })
}

export function newInstance(reducerKey, clue) {
  return (state, action) => {
    if(state === undefined)
      return initialState(clue)

    const {type, payload} = action

    switch(type) {
      //--MAIN HANDLER------------------------
      case reducerKey+'':
        for(let key in payload) {
          if(!state.has(key) || !state.get(key))
            state = state.set(key, Immutable.fromJS(payload[key]))
          else if(payload[key] == null)
            state = state.setIn([key], payload[key])
          else
            state = state.mergeIn([key], payload[key])
        }
        return state
      //--------------------------------------
      case reducerKey+'_clean':
        return initialState(clue)
    }

    return state
  }
}

//SELECTORS----------------------------------------------------------------------------------------------------

import { getState } from '../store'

//selectors caching
const _cache = {} 
function cache(radarKey, resultKey, returnValue) {
  _cache[radarKey] = _cache[radarKey] || {}
  if(!Immutable.is(_cache[radarKey][resultKey], returnValue))
    _cache[radarKey][resultKey] = returnValue
  return _cache[radarKey][resultKey]
}

export const clue = radarKey => {
  if(_cache[radarKey] && _cache[radarKey]['clue'])
    return _cache[radarKey]['clue']

  const clue = getState(radarKey, 'clue').toJS()
  return cache(radarKey, 'clue', clue)
}

import ReactDOM from 'react-dom'
export const getRadarRect = radarKey => {
  const radarRef = getState(radarKey, 'radarRef')
  if(radarRef) {
    let radarRect = ReactDOM.findDOMNode(radarRef).getBoundingClientRect()
    return {
      left: radarRect.left,
      right: radarRect.right,
      top: radarRect.top,
      bottom: radarRect.bottom,
      width: radarRect.width,
      height: radarRect.height,
    }
  }
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
  }
}

export const getAllTraitMounds = radarKey => {
  const radarState = getState(radarKey)
  return Immutable.fromJS({
    keywords: radarState.get('keywords'),
    compoundKeywords: radarState.get('compoundKeywords'),
    years: radarState.get('years'),
    applicants: radarState.get('applicants'),
    organizations: radarState.get('organizations'),
    inventors: radarState.get('inventors'),
    persons: radarState.get('persons'),
    ipcs: radarState.get('ipcs'),
  })
}

export const getAvailableTraitMounds = radarKey => {
  const traitMounds = getAllTraitMounds(radarKey).filter(traitMound => !!traitMound.get('all') && traitMound.get('isEnabled'))
  return cache(radarKey, 'getAvailableTraitMounds', traitMounds)
}

export const getClusterStylingMaps = radarKey => {
  const radarState = getState(radarKey)
  let stylingMaps = getAvailableTraitMounds(radarKey).map(traitMound => traitMound.get('actives'))
  stylingMaps = stylingMaps.set('swots', radarState.getIn(['swot', 'actives']))
  stylingMaps = stylingMaps.set('newest', radarState.getIn(['clusterTrends', 'activeNewest']))
  stylingMaps = stylingMaps.set('largest', radarState.getIn(['clusterTrends', 'activeLargest']))
  stylingMaps = stylingMaps.set('nearest', radarState.getIn(['clusterTrends', 'activeNearest']))
  return cache(radarKey, 'getClusterStylingMaps', stylingMaps)
}

export const getActiveTraitMoundKeySeqs = radarKey => {
  const seqs = getAvailableTraitMounds(radarKey).map(traitMound => {
    return traitMound.get('actives').keySeq()
  })
  return cache(radarKey, 'getActiveTraitMoundKeySeqs', seqs)
}

export const isUsingTool = radarKey => {
  const radarState = getState(radarKey)
  return radarState.get('usingAreaSelectionTool') || radarState.get('usingAreaDrawingTool')
    || radarState.getIn(['drawings', 'activeShapeTool']) != null
}