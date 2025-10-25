import styled from '@emotion/styled';
import React, { useEffect, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Shows per-group totals and reached points with a progress bar
const PointingTable = ({ tasks = [] }) => {
  const rows = useMemo(() => {
    const map = tasks.reduce((acc, t) => {
      const group = t.group || 'Sonstiges';
      const points = Number(t.points || 0);
      if (!acc[group])
        acc[group] = { group, total: 0, reached: 0, count: 0, done: 0 };
      acc[group].total += points;
      acc[group].count += 1;
      if (t.finished) {
        acc[group].reached += points;
        acc[group].done += 1;
      }
      return acc;
    }, {});
    return Object.values(map).sort((a, b) => a.group.localeCompare(b.group));
  }, [tasks]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.total += r.total;
        acc.reached += r.reached;
        acc.count += r.count;
        acc.done += r.done;
        return acc;
      },
      { total: 0, reached: 0, count: 0, done: 0 }
    );
  }, [rows]);

  const STORAGE_KEY = 'dlds.pointingTable.collapsed';
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'false');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch (e) {
      void e;
    }
  }, [collapsed]);

  if (rows.length === 0) return null;

  return (
    <Table>
      <PTHeader
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
      >
        <Left>
          <Chevron data-collapsed={collapsed}>
            <ExpandMoreIcon fontSize="small" />
          </Chevron>
          <h3>Fortschritte nach Gruppe</h3>
        </Left>
        <Totals>
          <strong>{summary.reached}</strong>/<span>{summary.total} pts</span>-
          <small>
            {summary.done} / {summary.count} erledigt
          </small>
        </Totals>
      </PTHeader>
      {!collapsed && (
        <>
          {rows.map((r) => {
            const pct =
              r.total > 0 ? Math.round((r.reached / r.total) * 100) : 0;
            return (
              <Row key={r.group}>
                <Wrapper>
                  <Name>{r.group}</Name>
                  <Right>
                    <Bar aria-label={`Fortschritt ${pct}%`}>
                      <Progress style={{ width: `${pct}%` }} />
                    </Bar>
                    <Stats>
                      <Percent>{pct}%</Percent>
                      <strong>{r.reached}</strong>/<span>{r.total} pts</span>
                      <small>
                        {r.done}/{r.count} erledigt
                      </small>
                    </Stats>
                  </Right>
                </Wrapper>
              </Row>
            );
          })}
        </>
      )}
    </Table>
  );
};

export default PointingTable;

const Table = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
`;

const PTHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  h3 {
    margin: 0;
    font-family: 'Outfit', Inter, system-ui, sans-serif;
    font-size: 16px;
  }
`;

const Left = styled.div`
  display: inline-flex;
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

const Totals = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  strong {
    color: var(--accent);
    font-weight: 700;
  }
  span {
    opacity: 0.85;
  }
  small {
    opacity: 0.7;
  }
`;

const Row = styled.div`
  padding: 6px;
  border-radius: 8px;
  /* &:hover {
    background: rgba(255, 255, 255, 0.04);
  } */
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
`;

const Name = styled.div`
  font-weight: 600;
`;

const Right = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Bar = styled.div`
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`;

const Progress = styled.div`
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(31, 224, 227, 0.9),
    rgba(31, 224, 227, 0.45)
  );
  box-shadow: 0 0 12px rgba(31, 224, 227, 0.6);
`;

const Stats = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  justify-content: flex-start;
  strong {
    color: var(--accent);
    font-weight: 700;
  }
  span {
    opacity: 0.85;
  }
  small {
    opacity: 0.7;
  }
  @media (min-width: 640px) {
    justify-content: flex-end;
  }
`;

const Percent = styled.span`
  opacity: 0.9;
  min-width: 36px;
`;
