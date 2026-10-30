use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Sha256Hasher {
    inner: Sha256,
}

#[wasm_bindgen]
impl Sha256Hasher {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: Sha256::new(),
        }
    }

    pub fn update(&mut self, chunk: &[u8]) {
        self.inner.update(chunk);
    }

    pub fn finalize_hex(self) -> String {
        let digest = self.inner.finalize();
        digest
            .iter()
            .map(|byte| format!("{byte:02x}"))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::Sha256Hasher;

    #[test]
    fn hashes_incremental_chunks() {
        let mut hasher = Sha256Hasher::new();
        hasher.update(b"a");
        hasher.update(b"bc");

        assert_eq!(
            hasher.finalize_hex(),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }
}
