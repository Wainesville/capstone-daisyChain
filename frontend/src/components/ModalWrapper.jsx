import React, { useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set the root element for accessibility

const ModalWrapper = ({ isOpen, onRequestClose, children }) => {
    useEffect(() => {
        const rootElement = document.getElementById('root');
        if (isOpen) {
            rootElement.setAttribute('inert', '');
        } else {
            rootElement.removeAttribute('inert');
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Movie Info Modal"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    zIndex: 10000, // High z-index value for modal content
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 9999, // High z-index value for modal overlay
                },
            }}
        >
            {children}
        </Modal>
    );
};

export default ModalWrapper;