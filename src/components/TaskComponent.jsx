import styled from '@emotion/styled';
import React from 'react';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

const TaskComponent = ({ task, onToggle, onToggleFavorite }) => {
  const status = task.finished ? 'Erledigt' : 'Offen';
  return (
    <Container data-finished={task.finished}>
      <Header>
        <FavButton
          type="button"
          aria-pressed={!!task.favorite}
          aria-label={
            task.favorite
              ? 'Aus Favoriten entfernen'
              : 'Zu Favoriten hinzufügen'
          }
          title={task.favorite ? 'Favorit' : 'Als Favorit markieren'}
          onClick={onToggleFavorite}
          data-active={!!task.favorite}
        >
          {task.favorite ? (
            <StarRoundedIcon fontSize="small" />
          ) : (
            <StarBorderRoundedIcon fontSize="small" />
          )}
        </FavButton>
        <Title>{task.title}</Title>
        <Right>
          <Label>
            <input
              aria-label="Als erledigt markieren"
              type="checkbox"
              checked={!!task.finished}
              onChange={onToggle}
            />
            <span>{status}</span>
          </Label>
        </Right>
      </Header>
      <Chips>
        <Chip>{task.points} Punkte</Chip>
      </Chips>
      <Description>{task.description}</Description>
      <Footer>
        <Reward>
          <b>Belohnung:</b> {task.achievement}
        </Reward>
      </Footer>
    </Container>
  );
};

export default TaskComponent;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--card);
  padding: 14px 14px 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  gap: 10px;
  box-shadow: 0 0 0 0 rgba(31, 224, 227, 0), 0 6px 18px rgba(0, 0, 0, 0.25);
  transition: box-shadow 180ms ease, transform 120ms ease,
    border-color 180ms ease;
  &:hover {
    transform: translateY(-1px);
    border-color: rgba(31, 224, 227, 0.25);
    box-shadow: 0 0 0 1px rgba(31, 224, 227, 0.25),
      0 10px 26px rgba(0, 0, 0, 0.35);
  }
  &[data-finished='true'] {
    border-color: rgba(95, 227, 154, 0.35);
    box-shadow: 0 0 0 1px rgba(95, 227, 154, 0.25),
      0 8px 22px rgba(0, 0, 0, 0.3);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: flex-end;
`;

const FavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease,
    transform 80ms ease;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  &:active {
    transform: translateY(1px);
  }
  &[data-active='true'] {
    color: #ffd54d;
    border-color: rgba(255, 213, 77, 0.45);
    box-shadow: 0 0 10px rgba(255, 213, 77, 0.25);
  }
`;

const Title = styled.h3`
  font-size: 16px;
  letter-spacing: 0.2px;
  margin-left: 0.5rem;
`;

const Chips = styled.div`
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.span`
  font-size: 12px;
  background: linear-gradient(
    180deg,
    rgba(31, 224, 227, 0.25),
    rgba(31, 224, 227, 0.12)
  );
  color: var(--text);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(31, 224, 227, 0.35);
`;

const Description = styled.p`
  margin: 2px 0 0 0;
  font-size: 14px;
  color: var(--muted);
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const Reward = styled.span`
  font-size: 12px;
  opacity: 0.95;
  color: var(--text);
  b {
    color: var(--accent);
    font-weight: 600;
  }
`;

const Status = styled.span`
  font-size: 12px;
  opacity: 0.9;
`;

const Label = styled.label`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
  input {
    accent-color: var(--success);
    width: 16px;
    height: 16px;
  }
`;
