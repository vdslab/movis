import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const nodesAdapter = createEntityAdapter({
  selectId: (node) => node.id,
});

const linksAdapter = createEntityAdapter({
  selectId: (link) => link.id,
});

const selectedNodesAdapter = createEntityAdapter({
  selectId: (node) => node.id,
});

const initialState = {
  nodes: nodesAdapter.getInitialState(),
  links: linksAdapter.getInitialState(),
  selectedNodes: selectedNodesAdapter.getInitialState(),
};

export const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    loadNetwork: (state, action) => {
      const { nodes, links } = action.payload;
      nodesAdapter.setAll(state.nodes, nodes);
      linksAdapter.setAll(state.links, links);
    },
    toggleSelectedNode: (state, action) => {
      const nodeId = action.payload;
      nodesAdapter.upsertOne(state.nodes, {
        ...state.selectedNodes.entities[nodeId],
        isSelected: true,
      });
    },
    removeNetwork: (state) => {
      nodesAdapter.removeAll(state.nodes);
      linksAdapter.removeAll(state.links);
      selectedNodesAdapter.removeAll(state.selectedNodes);
    },
  },
});

export const { loadNetwork, toggleSelectedNode, removeNetwork } =
  networkSlice.actions;

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
