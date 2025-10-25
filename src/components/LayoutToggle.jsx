import styled from '@emotion/styled';
import React from 'react';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

// value: 'grid' | 'list'
// onChange(next)
const LayoutToggle = ({ value = 'grid', onChange }) => {
  return (
    <Wrapper role="group" aria-label="Layout umschalten">
      <Button
        data-active={value === 'grid'}
        onClick={() => onChange?.('grid')}
        title="Raster"
      >
        <ViewModuleIcon fontSize="small" />
      </Button>
      <Button
        data-active={value === 'list'}
        onClick={() => onChange?.('list')}
        title="Liste"
      >
        <ViewAgendaIcon fontSize="small" />
      </Button>
    </Wrapper>
  );
};

export default LayoutToggle;

const Wrapper = styled.div`
  display: inline-flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  color: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &[data-active='true'] {
    background: rgba(31, 224, 227, 0.22);
    color: var(--text);
  }

  &:not([data-active='true']):hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;
