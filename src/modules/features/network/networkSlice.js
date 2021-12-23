import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const nodesAdapter = createEntityAdapter({
  selectId: (node) => node.id,
});

const linksAdapter = createEntityAdapter({
  selectId: (link) => link.source + link.target,
});

const selectedNodesAdapter = createEntityAdapter({
  selectId: (node) => node.id,
});

const initialState = {
  nodes: nodesAdapter.getInitialState(),
  links: linksAdapter.getInitialState(),
  selectedNodes: selectedNodesAdapter.getInitialState(),
  search: "",
};

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    loadNetwork: (state, action) => {
      const { nodes, links } = action.payload;
      nodesAdapter.setAll(
        state.nodes,
        nodes.map((node) => ({ ...node, isSelected: false }))
      );
      linksAdapter.setAll(state.links, links);
    },
    toggleSelectedNode: (state, action) => {
      const nodeId = action.payload;
      nodeId;
      if (state.selectedNodes.ids.includes(nodeId)) {
        nodesAdapter.removeOne(state.selectedNodes, nodeId);
      } else {
        nodesAdapter.addOne(state.selectedNodes, state.nodes.entities[nodeId]);
      }
    },
    removeNetwork: (state) => {
      nodesAdapter.removeAll(state.nodes);
      linksAdapter.removeAll(state.links);
      selectedNodesAdapter.removeAll(state.selectedNodes);
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    clearSearch: (state) => {
      state.search = "";
    },
  },
});

export const {
  loadNetwork,
  toggleSelectedNode,
  removeNetwork,
  setSearch,
  clearSearch,
} = networkSlice.actions;

export const networkReducer = networkSlice.reducer;

export const selectNodes = nodesAdapter.getSelectors(
  (state) => state.network.nodes
);

export const selectLinks = nodesAdapter.getSelectors(
  (state) => state.network.links
);

export const selectSelectedNodes = selectedNodesAdapter.getSelectors(
  (state) => state.network.selectedNodes
);

export const selectSearch = (state) => state.network.search;
