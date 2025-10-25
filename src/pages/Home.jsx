import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import tasksData from '../tasks/tasks.json';
// import axios from 'axios';
import TaskComponent from '../components/TaskComponent';
import PointingTable from '../components/PointingTable';
import LayoutToggle from '../components/LayoutToggle';
import ExpandToggle from '../components/ExpandToggle';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  WarningAmberOutlined,
  DragIndicator,
  ExpandMoreOutlined,
} from '@mui/icons-material';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const STORAGE_KEY = 'dlds.tasks.finished';
  const FAVORITES_KEY = 'dlds.tasks.favorites';
  const COLLAPSE_KEY = 'dlds.groups.collapsed';
  const TYPES_COLLAPSE_KEY = 'dlds.types.collapsed';
  const TYPES_ORDER_KEY = 'dlds.types.order';
  const FILTER_KEY = 'dlds.tasks.filter';
  const SEARCH_KEY = 'dlds.tasks.searchQuery';
  const POINTING_TABLE_KEY = 'dlds.pointingTable.collapsed';
  const ORDER_KEY = 'dlds.groups.order';

  const [query, setQuery] = useState(() => {
    try {
      return localStorage.getItem(SEARCH_KEY) || '';
    } catch {
      return '';
    }
  });
  const [filter, setFilter] = useState(() => {
    try {
      return localStorage.getItem(FILTER_KEY) || 'all';
    } catch {
      return 'all';
    }
  });
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [collapsedTypes, setCollapsedTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TYPES_COLLAPSE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [typeOrderByGroup, setTypeOrderByGroup] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TYPES_ORDER_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const LAYOUT_KEY = 'dlds.tasks.layout';
  const [layout, setLayout] = useState(() => {
    try {
      return localStorage.getItem(LAYOUT_KEY) || 'grid';
    } catch {
      return 'grid';
    }
  });
  const [groupOrder, setGroupOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchTasks = async () => {
      // TODO: Fetch your Tasks from the database or API here
      // const res = await axios.get('api/tasks');

      // if (res.status !== 200) throw new Error('Error fetching tasks');
      // return res.data;

      // Temporary: use local JSON tasks
      return tasksData;
    };
    fetchTasks().then((fetchedTasks) => {
      // Load finished states from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
        const withFinished = fetchedTasks.map((t) => {
          const key = `${t.group}|${t.title}`;
          let next = t;
          if (saved[key] !== undefined)
            next = { ...next, finished: !!saved[key] };
          if (favs[key] !== undefined)
            next = { ...next, favorite: !!favs[key] };
          return next;
        });
        setTasks(withFinished);
      } catch {
        setTasks(fetchedTasks);
      }
    });
  }, []);

  // Persist filter selection
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, filter);
    } catch (e) {
      void e;
    }
  }, [filter]);

  // Persist search query
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_KEY, query);
    } catch (e) {
      void e;
    }
  }, [query]);

  // Persist layout
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch (e) {
      void e;
    }
  }, [layout]);

  // Persist group order
  useEffect(() => {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(groupOrder));
    } catch (e) {
      void e;
    }
  }, [groupOrder]);

  // Persist type order per group
  useEffect(() => {
    try {
      localStorage.setItem(TYPES_ORDER_KEY, JSON.stringify(typeOrderByGroup));
    } catch (e) {
      void e;
    }
  }, [typeOrderByGroup]);

  const toggleFinished = (task) => {
    setTasks((prev) => {
      const key = `${task.group}|${task.title}`;
      const updated = prev.map((t) =>
        t.group === task.group && t.title === task.title
          ? { ...t, finished: !t.finished }
          : t
      );
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved[key] = !task.finished;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {
        void e;
      }
      return updated;
    });
  };

  const toggleFavorite = (task) => {
    setTasks((prev) => {
      const key = `${task.group}|${task.title}`;
      const updated = prev.map((t) =>
        t.group === task.group && t.title === task.title
          ? { ...t, favorite: !t.favorite }
          : t
      );
      try {
        const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
        favs[key] = !task.favorite;
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
      } catch (e) {
        void e;
      }
      return updated;
    });
  };
  // Apply filter, then group tasks by the `group` field
  const visibleTasks = useMemo(() => {
    // Status filter
    let list = tasks;
    if (filter === 'done') list = tasks.filter((t) => !!t.finished);
    if (filter === 'open') list = tasks.filter((t) => !t.finished);
    if (filter === 'fav') list = tasks.filter((t) => !!t.favorite);

    // Text search (case-insensitive across common fields)
    const q = query.trim().toLowerCase();
    if (!q) return list;
    const matches = (t) => {
      const fields = [t.title, t.description, t.achievement, t.type, t.group];
      return fields.some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(q)
      );
    };
    return list.filter(matches);
  }, [tasks, filter, query]);

  const grouped = useMemo(() => {
    return visibleTasks.reduce((acc, task) => {
      const key = task.group || 'Sonstiges';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  }, [visibleTasks]);

  const orderedGroupNames = useMemo(() => {
    const names = Object.keys(grouped);
    const fromSaved = groupOrder.filter((g) => names.includes(g));
    const unsaved = names
      .filter((g) => !groupOrder.includes(g))
      .sort((a, b) => a.localeCompare(b));
    return [...fromSaved, ...unsaved];
  }, [grouped, groupOrder]);

  // Ensure new groups default to collapsed = true
  useEffect(() => {
    const names = Object.keys(grouped);
    if (names.length === 0) return;
    setCollapsed((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const name of names) {
        if (next[name] === undefined) {
          next[name] = true; // default collapsed
          changed = true;
        }
      }
      if (changed) {
        try {
          localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next));
        } catch (e) {
          void e;
        }
        return next;
      }
      return prev;
    });
  }, [grouped]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGroupOrder((prev) => {
      const current = orderedGroupNames;
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const nextVisible = arrayMove(current, oldIndex, newIndex);
      const rest = prev.filter((g) => !nextVisible.includes(g));
      return [...nextVisible, ...rest];
    });
  };

  // Bulk open/close handlers for all groups
  const setAllGroupsCollapsed = (collapsedState) => {
    const names = Object.keys(grouped);
    const next = names.reduce((acc, n) => {
      acc[n] = collapsedState;
      return acc;
    }, {});
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next));
    } catch (e) {
      void e;
    }
  };

  const counts = useMemo(() => {
    const done = tasks.filter((t) => !!t.finished).length;
    const open = tasks.length - done;
    const fav = tasks.filter((t) => !!t.favorite).length;
    return { all: tasks.length, done, open, fav };
  }, [tasks]);

  // Sortable wrapper for group cards using dnd-kit
  const SortableGroup = ({ id, children }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div ref={setNodeRef} style={style}>
        {typeof children === 'function'
          ? children({ attributes, listeners, isDragging })
          : children}
      </div>
    );
  };

  // Sortable wrapper for type sub-groups
  const SortableType = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div ref={setNodeRef} style={style}>
        {typeof children === 'function'
          ? children({ attributes, listeners })
          : children}
      </div>
    );
  };

  const handleResetTasks = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SEARCH_KEY);
      localStorage.removeItem(FILTER_KEY);
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(COLLAPSE_KEY);
      localStorage.removeItem(TYPES_COLLAPSE_KEY);
      localStorage.removeItem(POINTING_TABLE_KEY);
      localStorage.removeItem(ORDER_KEY);
      localStorage.removeItem(TYPES_ORDER_KEY);

      setCollapsed({});
      setCollapsedTypes({});
      setTypeOrderByGroup({});
      setFilter('all');
      setQuery('');
      setCollapsed({});
      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          finished: false,
          favorite: false,
        }))
      );

      setOpenDialog(false);
    } catch (e) {
      void e;
    }
  };

  return (
    <Container>
      {tasks.length === 0 ? (
        <Empty>Keine Aufgaben vorhanden</Empty>
      ) : (
        <>
          <PointingTable tasks={tasks} />
          <Toolbar>
            <SearchInput
              placeholder="Suche nach Aufgabe, Beschreibung, Belohnung..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <ClearButton onClick={() => setQuery('')}>Löschen</ClearButton>
            )}
          </Toolbar>
          <BarContainer>
            <FilterBar>
              <FilterButton
                data-active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Alle <small>({counts.all})</small>
              </FilterButton>
              <FilterButton
                data-active={filter === 'open'}
                onClick={() => setFilter('open')}
              >
                Offen <small>({counts.open})</small>
              </FilterButton>
              <FilterButton
                data-active={filter === 'done'}
                onClick={() => setFilter('done')}
              >
                Erledigt <small>({counts.done})</small>
              </FilterButton>
              <FilterButton
                data-active={filter === 'fav'}
                onClick={() => setFilter('fav')}
                title="Nur Favoriten anzeigen"
              >
                Favoriten <small>({counts.fav})</small>
              </FilterButton>
            </FilterBar>
            <RightBar>
              <LayoutToggle value={layout} onChange={setLayout} />
              <ExpandToggle expand={setAllGroupsCollapsed} />
              <ClearButton onClick={() => setOpenDialog(true)}>
                Alle Aufgaben zurücksetzen
              </ClearButton>
            </RightBar>
          </BarContainer>

          {Object.keys(grouped).length === 0 ? (
            <Empty>Keine Aufgaben entsprechen diesem Filter</Empty>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedGroupNames}
                strategy={verticalListSortingStrategy}
              >
                {orderedGroupNames.map((groupName) => {
                  const groupTasks = grouped[groupName] || [];
                  return (
                    <SortableGroup key={groupName} id={groupName}>
                      {(handleProps) => (
                        <GroupCard data-dragging={handleProps.isDragging}>
                          <GroupHeader
                            aria-expanded={!collapsed[groupName]}
                            title="Klicke, um die Gruppe zu öffnen oder schließen"
                            onClick={() => {
                              setCollapsed((prev) => {
                                const next = {
                                  ...prev,
                                  [groupName]: !prev[groupName],
                                };
                                try {
                                  localStorage.setItem(
                                    COLLAPSE_KEY,
                                    JSON.stringify(next)
                                  );
                                } catch (e) {
                                  void e;
                                }
                                return next;
                              });
                            }}
                          >
                            <HeaderLeft>
                              <DragHandle
                                {...handleProps.attributes}
                                {...handleProps.listeners}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                aria-label={`${groupName} verschieben`}
                                title="Ziehen, um die Gruppe zu verschieben"
                              >
                                <DragIndicator fontSize="small" />
                              </DragHandle>

                              <Chevron data-collapsed={!!collapsed[groupName]}>
                                <ExpandMoreOutlined fontSize="small" />
                              </Chevron>
                              <h2>{groupName}</h2>
                            </HeaderLeft>
                            <HeaderRight>
                              <Count>{groupTasks.length} Aufgaben</Count>
                            </HeaderRight>
                          </GroupHeader>
                          {!collapsed[groupName] && (
                            <div>
                              {(() => {
                                const typeMap = groupTasks.reduce((acc, t) => {
                                  const type = t.type || 'Allgemein';
                                  if (!acc[type]) acc[type] = [];
                                  acc[type].push(t);
                                  return acc;
                                }, {});
                                const allTypes = Object.keys(typeMap);
                                const saved = typeOrderByGroup[groupName] || [];
                                const fromSaved = saved.filter((n) =>
                                  allTypes.includes(n)
                                );
                                const unsaved = allTypes
                                  .filter((n) => !saved.includes(n))
                                  .sort((a, b) => a.localeCompare(b));
                                const orderedTypes = [...fromSaved, ...unsaved];

                                const handleTypeDragEnd = ({
                                  active,
                                  over,
                                }) => {
                                  if (!over || active.id === over.id) return;
                                  setTypeOrderByGroup((prev) => {
                                    const current = orderedTypes;
                                    const oldIndex = current.indexOf(active.id);
                                    const newIndex = current.indexOf(over.id);
                                    if (oldIndex === -1 || newIndex === -1)
                                      return prev;
                                    const nextVisible = arrayMove(
                                      current,
                                      oldIndex,
                                      newIndex
                                    );
                                    const rest = (prev[groupName] || []).filter(
                                      (n) =>
                                        !nextVisible.includes(n) &&
                                        allTypes.includes(n)
                                    );
                                    return {
                                      ...prev,
                                      [groupName]: [...nextVisible, ...rest],
                                    };
                                  });
                                };

                                return (
                                  <DndContext
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleTypeDragEnd}
                                  >
                                    <SortableContext
                                      items={orderedTypes}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {orderedTypes.map((typeName) => {
                                        const typeTasks = typeMap[typeName];
                                        const typeKey = `${groupName}::${typeName}`;
                                        const doneCount = typeTasks.filter(
                                          (t) => !!t.finished
                                        ).length;
                                        return (
                                          <SortableType
                                            key={typeName}
                                            id={typeName}
                                          >
                                            {(handleProps) => (
                                              <SubGroup>
                                                <SubHeader
                                                  title="Ziehe, um die Gruppe zu verschieben"
                                                  aria-expanded={
                                                    !collapsedTypes[typeKey]
                                                  }
                                                  onClick={() => {
                                                    setCollapsedTypes(
                                                      (prev) => {
                                                        const next = {
                                                          ...prev,
                                                          [typeKey]:
                                                            !prev[typeKey],
                                                        };
                                                        try {
                                                          localStorage.setItem(
                                                            TYPES_COLLAPSE_KEY,
                                                            JSON.stringify(next)
                                                          );
                                                        } catch (e) {
                                                          void e;
                                                        }
                                                        return next;
                                                      }
                                                    );
                                                  }}
                                                >
                                                  <HeaderLeft>
                                                    <DragHandle
                                                      {...handleProps.attributes}
                                                      {...handleProps.listeners}
                                                      onMouseDown={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      onTouchStart={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      aria-label={`${typeName} verschieben`}
                                                      title="Ziehen, um den Typ zu verschieben"
                                                    >
                                                      <DragIndicator fontSize="small" />
                                                    </DragHandle>
                                                    <Chevron
                                                      data-collapsed={
                                                        !!collapsedTypes[
                                                          typeKey
                                                        ]
                                                      }
                                                    >
                                                      <ExpandMoreOutlined fontSize="small" />
                                                    </Chevron>
                                                    <h3>{typeName}</h3>
                                                  </HeaderLeft>
                                                  <SubHeaderRight>
                                                    <SubCount
                                                      data-done={
                                                        doneCount ===
                                                        typeTasks.length
                                                      }
                                                    >
                                                      {doneCount}/
                                                      {typeTasks.length}{' '}
                                                      erledigt
                                                    </SubCount>
                                                  </SubHeaderRight>
                                                </SubHeader>
                                                {!collapsedTypes[typeKey] && (
                                                  <TasksGrid
                                                    data-layout={layout}
                                                  >
                                                    {typeTasks.map((task) => (
                                                      <TaskComponent
                                                        key={`${groupName}-${typeName}-${task.title}`}
                                                        task={task}
                                                        onToggle={() =>
                                                          toggleFinished(task)
                                                        }
                                                        onToggleFavorite={() =>
                                                          toggleFavorite(task)
                                                        }
                                                      />
                                                    ))}
                                                  </TasksGrid>
                                                )}
                                              </SubGroup>
                                            )}
                                          </SortableType>
                                        );
                                      })}
                                    </SortableContext>
                                  </DndContext>
                                );
                              })()}
                            </div>
                          )}
                        </GroupCard>
                      )}
                    </SortableGroup>
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
      {openDialog && (
        <StyledDialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            <TitleRow>
              <WarningAmberOutlined className="warn" />
              <span>Aufgaben zurücksetzen?</span>
            </TitleRow>
          </DialogTitle>
          <DialogContent>
            <DialogText>
              Möchtest du wirklich alle Aufgaben zurücksetzen? Der Fortschritt
              geht verloren und kann nicht rückgängig gemacht werden.
            </DialogText>
          </DialogContent>
          <DialogActions>
            <ClearButton onClick={() => setOpenDialog(false)}>
              Abbrechen
            </ClearButton>
            <ClearButton data-variant="danger" onClick={handleResetTasks}>
              Zurücksetzen
            </ClearButton>
          </DialogActions>
        </StyledDialog>
      )}
    </Container>
  );
};

export default Home;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
`;

const GroupCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 8px 12px 8px;
  &[data-dragging='true'] {
    outline: 1px dashed rgba(255, 255, 255, 0.2);
  }
`;

const GroupHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  h2 {
    margin: 0;
    font-size: 18px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Chevron = styled.span`
  display: inline-flex;
  transform: rotate(0deg);
  transition: transform 120ms ease-out;
  &[data-collapsed='true'] {
    transform: rotate(-90deg);
  }
`;

const Count = styled.span`
  opacity: 0.8;
  font-size: 12px;
`;

const HeaderRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const DragHandle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: grab;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  &:active {
    cursor: grabbing;
  }
`;

const SubGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 8px 12px 8px;
  margin-top: 8px;
`;

const SubHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  h3 {
    margin: 0;
    font-size: 15px;
  }
`;

const SubCount = styled.span`
  opacity: 0.8;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 4px;
  &[data-done='true'] {
    background: rgba(87, 246, 79, 0.223);
  }
`;

const SubHeaderRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const TasksGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  &[data-layout='list'] {
    grid-template-columns: 1fr;
  }
`;

const Empty = styled.div`
  opacity: 0.8;
  padding: 16px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 4px;
`;

const SearchInput = styled.input`
  flex: 1 1 auto;
  min-width: 240px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
`;

const ClearButton = styled.button`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease,
    transform 80ms ease;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  &:active {
    transform: translateY(1px);
  }
  &[data-variant='danger'] {
    background: rgba(255, 62, 62, 0.18);
    border-color: rgba(255, 62, 62, 0.35);
  }
  &[data-variant='danger']:hover {
    background: rgba(255, 62, 62, 0.28);
  }
`;

const BarContainer = styled.div`
  display: inline-flex;
  justify-content: space-between;
  width: 100%;

  @media (max-width: 780px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
`;

const RightBar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const FilterBar = styled.div`
  display: inline-flex;
  gap: 8px;
  margin: 4px 4px 0 4px;
`;

const FilterButton = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: inherit;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  small {
    opacity: 0.8;
  }
  &[data-active='true'] {
    background: rgba(95, 227, 154, 0.2);
    border-color: rgba(95, 227, 154, 0.35);
  }
`;

// Styled MUI Dialog to match the app theme
const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    min-width: 340px;
  }

  .MuiDialogTitle-root {
    padding: 14px 16px 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .MuiDialogContent-root {
    padding: 14px 16px;
  }

  .MuiDialogActions-root {
    padding: 12px 16px 14px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Outfit', Inter, system-ui, sans-serif;
  font-size: 18px;
  .warn {
    color: var(--danger);
  }
`;

const DialogText = styled.p`
  margin: 0;
  color: var(--muted);
`;
