import { Component, ViewChild, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import WebViewer, { Core, WebViewerInstance } from '@pdftron/webviewer';
import { SplitComponent } from 'angular-split';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(SplitComponent, { static: false }) splitEl: SplitComponent;
  @ViewChild('viewer1') viewer1: ElementRef;
  @ViewChild('viewer2') viewer2: ElementRef;
  @ViewChild('viewer3') viewer3: ElementRef;
  @ViewChild("openDocOne", {static: false}) openDocOne: ElementRef;
  @ViewChild("openDocTwo", {static: false}) openDocTwo: ElementRef;
  wvInstance1: WebViewerInstance;
  wvInstance2: WebViewerInstance;
  wvInstance3: WebViewerInstance;
  @Output() coreControlsEvent:EventEmitter<string> = new EventEmitter(); 
  public doc1: Core.PDFNet.PDFDoc;
  public doc2: Core.PDFNet.PDFDoc;
  public doc1Buffer: any;
  public doc2Buffer: any;
  public minSize;

  private documentLoaded$: Subject<void>;

  constructor() {
    this.documentLoaded$ = new Subject<void>();
    this.minSize = 10;
  }

  ngAfterViewInit(): void {
  
    WebViewer({
      path: '../lib',
      enableAnnotations: false
    }, this.viewer1.nativeElement).then(async instance1 => {
      this.wvInstance1 = instance1;
      instance1.UI.disableElements(['ribbons', 'leftPanelButton', 'viewControlsButton', 'notesPanelButton','downloadButton']);
      this.coreControlsEvent.emit(instance1.UI.LayoutMode.Single);
      const { PDFNet } = instance1.Core;
      await PDFNet.initialize();
    })

    WebViewer({
      path: '../lib',
      enableAnnotations: false,
      fullAPI: true
    }, this.viewer2.nativeElement).then(async instance2 => {
      this.wvInstance2 = instance2;
      instance2.UI.disableElements(['ribbons', 'leftPanelButton', 'viewControlsButton', 'notesPanelButton','downloadButton']);
      this.coreControlsEvent.emit(instance2.UI.LayoutMode.Single);
      const { PDFNet } = instance2.Core;
      await PDFNet.initialize();
    })

    WebViewer({
      path: '../lib',
      fullAPI: true
    }, this.viewer3.nativeElement).then(async instance3 => {
      this.wvInstance3 = instance3;
      instance3.UI.disableElements(['ribbons', 'leftPanelButton', 'viewControlsButton']);
      this.coreControlsEvent.emit(instance3.UI.LayoutMode.Single);
      const { PDFNet, documentViewer } = instance3.Core;
      await PDFNet.initialize();
      // wait until the document has been loaded
      documentViewer.addEventListener('documentLoaded', () => {
        instance3.UI.openElements(['notesPanel']);
        this.wvInstance3.UI.setLayoutMode(this.wvInstance3.UI.LayoutMode.FacingContinuous);
      });
    })
  }

  ngOnInit() {
  }

  onClickDocOne() {
    const openDocOne = this.openDocOne.nativeElement;openDocOne.onchange = async () => {
      this.wvInstance1.UI.loadDocument(openDocOne.files[0]);
      this.doc1Buffer = openDocOne.files[0];
    }
    openDocOne.click();
  }

  onClickDocTwo() {
    const openDocTwo = this.openDocTwo.nativeElement;openDocTwo.onchange = async () => {
      this.wvInstance2.UI.loadDocument(openDocTwo.files[0]);
      this.doc2Buffer = openDocTwo.files[0];
    }
    openDocTwo.click();
  }

  async onClickCompare() {
    const { PDFNet } = this.wvInstance3.Core;
    const newDoc = await PDFNet.PDFDoc.create();
    const doc1 = await PDFNet.PDFDoc.createFromBuffer(await this.doc1Buffer.arrayBuffer());
    const doc2 = await PDFNet.PDFDoc.createFromBuffer(await this.doc2Buffer.arrayBuffer());
    await newDoc.appendTextDiffDoc(doc1, doc2);
    this.wvInstance3.UI.loadDocument(newDoc);
}
 
  getDocumentLoadedObservable() {
    return this.documentLoaded$.asObservable();
  }
}

