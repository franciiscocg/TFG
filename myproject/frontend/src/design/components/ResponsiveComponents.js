import React from 'react';
import styled from 'styled-components';
import theme from '../theme';

// Componente de utilidad para crear diseños responsivos con grid
const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 12}, 1fr);
  gap: ${props => props.gap || theme.spacing.md};
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(${props => props.columnsLg || props.columns || 12}, 1fr);
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(${props => props.columnsMd || 6}, 1fr);
    gap: ${props => props.gapMd || props.gap || theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(${props => props.columnsSm || 1}, 1fr);
    gap: ${props => props.gapSm || props.gap || theme.spacing.sm};
  }
`;

// Componente de utilidad para crear diseños responsivos con flex
const ResponsiveFlex = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'wrap'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || theme.spacing.md};
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: ${props => props.directionMd || props.direction || 'row'};
    gap: ${props => props.gapMd || props.gap || theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: ${props => props.directionSm || 'column'};
    gap: ${props => props.gapSm || props.gap || theme.spacing.sm};
  }
`;

// Componente de utilidad para crear contenedores responsivos
const ResponsiveContainer = styled.div`
  width: 100%;
  max-width: ${props => props.maxWidth || '1200px'};
  margin: 0 auto;
  padding: ${props => props.padding || `0 ${theme.spacing.md}`};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${props => props.paddingMd || props.padding || `0 ${theme.spacing.sm}`};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${props => props.paddingSm || props.padding || `0 ${theme.spacing.sm}`};
  }
`;

// Componente de utilidad para ocultar/mostrar elementos según el tamaño de pantalla
const Responsive = styled.div`
  display: ${props => props.hideOn?.includes('all') ? 'none' : 'block'};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: ${props => props.hideOn?.includes('lg') ? 'none' : props.showOn?.includes('lg') ? 'block' : undefined};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: ${props => props.hideOn?.includes('md') ? 'none' : props.showOn?.includes('md') ? 'block' : undefined};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: ${props => props.hideOn?.includes('sm') ? 'none' : props.showOn?.includes('sm') ? 'block' : undefined};
  }
`;

// Componente para espaciado responsivo
const Spacer = styled.div`
  height: ${props => props.height || theme.spacing.md};
  width: ${props => props.width || '100%'};
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: ${props => props.heightMd || props.height || theme.spacing.sm};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    height: ${props => props.heightSm || props.height || theme.spacing.sm};
  }
`;

// Componente para texto responsivo
const ResponsiveText = styled.p`
  font-size: ${props => props.size || theme.typography.fontSize.base};
  font-weight: ${props => props.weight || theme.typography.fontWeight.regular};
  line-height: ${props => props.lineHeight || theme.typography.lineHeight.normal};
  text-align: ${props => props.align || 'left'};
  color: ${props => props.color || theme.colors.text.primary};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${props => props.sizeMd || props.size || theme.typography.fontSize.base};
    text-align: ${props => props.alignMd || props.align || 'left'};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${props => props.sizeSm || props.size || theme.typography.fontSize.sm};
    text-align: ${props => props.alignSm || props.align || 'left'};
  }
`;

// Componente para imágenes responsivas
const ResponsiveImage = styled.img`
  max-width: 100%;
  height: ${props => props.height || 'auto'};
  object-fit: ${props => props.objectFit || 'cover'};
  border-radius: ${props => props.borderRadius || theme.borderRadius.md};
`;

// Componente para botones responsivos
const ResponsiveButton = styled.button`
  padding: ${props => props.padding || '0.75rem 1.5rem'};
  font-size: ${props => props.fontSize || theme.typography.fontSize.base};
  font-weight: ${props => props.fontWeight || theme.typography.fontWeight.semibold};
  background: ${props => props.background || theme.colors.primary.main};
  color: ${props => props.color || theme.colors.primary.contrast};
  border: ${props => props.border || 'none'};
  border-radius: ${props => props.borderRadius || theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    background: ${props => props.backgroundHover || theme.colors.primary.light};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${props => props.paddingMd || props.padding || '0.75rem 1.25rem'};
    font-size: ${props => props.fontSizeMd || props.fontSize || theme.typography.fontSize.base};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${props => props.paddingSm || props.padding || '0.5rem 1rem'};
    font-size: ${props => props.fontSizeSm || props.fontSize || theme.typography.fontSize.sm};
    width: ${props => props.fullWidthOnMobile ? '100%' : 'auto'};
  }
  
  @media (hover: none) {
    &:hover {
      transform: none;
    }
  }
`;

// Componente para tarjetas responsivas
const ResponsiveCard = styled.div`
  background-color: ${props => props.background || theme.colors.background.paper};
  border-radius: ${props => props.borderRadius || theme.borderRadius.lg};
  box-shadow: ${props => props.boxShadow || theme.shadows.md};
  padding: ${props => props.padding || theme.spacing.lg};
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: ${props => props.hoverEffect ? 'translateY(-5px)' : 'none'};
    box-shadow: ${props => props.hoverEffect ? theme.shadows.lg : props.boxShadow || theme.shadows.md};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${props => props.paddingMd || props.padding || theme.spacing.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${props => props.paddingSm || props.padding || theme.spacing.sm};
  }
  
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: ${props => props.boxShadow || theme.shadows.md};
    }
  }
`;

export {
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveContainer,
  Responsive,
  Spacer,
  ResponsiveText,
  ResponsiveImage,
  ResponsiveButton,
  ResponsiveCard
};
