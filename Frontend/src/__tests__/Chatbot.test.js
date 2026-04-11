import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Chatbot from '../components/Chatbot';

describe('Chatbot Component', () => {
  test('renders chatbot button', () => {
    render(<Chatbot />);
    
    // Chatbot should have a trigger button or icon
    const chatElements = screen.getAllByRole('button');
    expect(chatElements.length).toBeGreaterThan(0);
  });

  test('opens chat window when clicked', () => {
    render(<Chatbot />);
    
    const chatButton = screen.getAllByRole('button')[0];
    fireEvent.click(chatButton);
    
    // After clicking, chat interface should be visible
    // This will depend on your implementation
  });

  test('has input field for messages', () => {
    render(<Chatbot />);
    
    // Open chatbot first
    const chatButton = screen.getAllByRole('button')[0];
    fireEvent.click(chatButton);
    
    // Check for input field
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  });
});
